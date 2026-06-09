-- ============================================================
-- EMPLOYEE LEAVE MANAGEMENT SYSTEM - Database Setup
-- Run: psql -U postgres -d loginapp -f leave_setup.sql
-- ============================================================

-- ============================================================
-- TABLE 1: Leave Types (Master)
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_types (
    id SERIAL PRIMARY KEY,
    leave_name VARCHAR(100) NOT NULL UNIQUE,
    total_days INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed leave types
INSERT INTO leave_types (leave_name, total_days) VALUES
    ('Casual Leave', 12),
    ('Sick Leave', 10),
    ('Earned Leave', 15),
    ('Maternity Leave', 180)
ON CONFLICT (leave_name) DO NOTHING;

-- ============================================================
-- TABLE 2: Employee Leave Balance
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_balance (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    available_days INT NOT NULL DEFAULT 0,
    year INT NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    UNIQUE(employee_id, leave_type_id, year)
);

-- ============================================================
-- TABLE 3: Leave Applications
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_applications (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type_id INT NOT NULL,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    total_days INT NOT NULL,
    reason TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employee_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (leave_type_id) REFERENCES leave_types(id) ON DELETE CASCADE,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'manager_approved', 'manager_rejected', 'hr_approved', 'hr_rejected', 'cancelled')),
    CONSTRAINT valid_dates CHECK (to_date >= from_date),
    CONSTRAINT positive_days CHECK (total_days > 0)
);

-- ============================================================
-- TABLE 4: Approval History (Audit Trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS approval_history (
    id SERIAL PRIMARY KEY,
    leave_id INT NOT NULL,
    approved_by INT NOT NULL,
    role VARCHAR(30) NOT NULL,
    action VARCHAR(50) NOT NULL,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (leave_id) REFERENCES leave_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT valid_action CHECK (action IN ('applied', 'manager_approved', 'manager_rejected', 'hr_approved', 'hr_rejected', 'cancelled'))
);

-- ============================================================
-- ADD manager_id column to employee_profiles
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'employee_profiles' AND column_name = 'manager_id'
    ) THEN
        ALTER TABLE employee_profiles ADD COLUMN manager_id INT REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_leave_applications_employee ON leave_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_applications_status ON leave_applications(status);
CREATE INDEX IF NOT EXISTS idx_leave_applications_dates ON leave_applications(from_date, to_date);
CREATE INDEX IF NOT EXISTS idx_leave_balance_employee_year ON leave_balance(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_approval_history_leave ON approval_history(leave_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_manager ON employee_profiles(manager_id);

-- ============================================================
-- VIEW 1: Leave Summary (joins applications with users, types, departments)
-- ============================================================
CREATE OR REPLACE VIEW v_leave_summary AS
SELECT
    la.id AS leave_id,
    la.employee_id,
    u.name AS employee_name,
    u.email AS employee_email,
    d.department_name,
    lt.leave_name AS leave_type,
    lt.total_days AS type_total_days,
    la.from_date,
    la.to_date,
    la.total_days,
    la.reason,
    la.status,
    la.created_at AS applied_on,
    la.updated_at,
    ep.manager_id,
    mu.name AS manager_name
FROM leave_applications la
INNER JOIN employee_profiles ep ON la.employee_id = ep.id
INNER JOIN users u ON ep.user_id = u.id
INNER JOIN departments d ON ep.department_id = d.id
INNER JOIN leave_types lt ON la.leave_type_id = lt.id
LEFT JOIN users mu ON ep.manager_id = mu.id;

-- ============================================================
-- VIEW 2: Department-wise Leave Statistics
-- ============================================================
CREATE OR REPLACE VIEW v_department_leave_stats AS
SELECT
    d.id AS department_id,
    d.department_name,
    COUNT(la.id) AS total_applications,
    SUM(CASE WHEN la.status = 'hr_approved' THEN la.total_days ELSE 0 END) AS total_approved_days,
    SUM(CASE WHEN la.status = 'pending' THEN 1 ELSE 0 END) AS pending_count,
    SUM(CASE WHEN la.status = 'hr_approved' THEN 1 ELSE 0 END) AS approved_count,
    SUM(CASE WHEN la.status IN ('manager_rejected', 'hr_rejected') THEN 1 ELSE 0 END) AS rejected_count,
    COUNT(DISTINCT la.employee_id) AS employees_applied
FROM departments d
LEFT JOIN employee_profiles ep ON ep.department_id = d.id
LEFT JOIN leave_applications la ON la.employee_id = ep.id
GROUP BY d.id, d.department_name;

-- ============================================================
-- VIEW 3: Employee Leave Balance with type names
-- ============================================================
CREATE OR REPLACE VIEW v_employee_leave_balance AS
SELECT
    lb.id AS balance_id,
    lb.employee_id,
    u.name AS employee_name,
    d.department_name,
    lt.leave_name,
    lt.total_days AS total_allocated,
    lb.available_days,
    (lt.total_days - lb.available_days) AS used_days,
    lb.year,
    ROUND(
        (lb.available_days::DECIMAL / NULLIF(lt.total_days, 0)) * 100, 1
    ) AS balance_percentage
FROM leave_balance lb
INNER JOIN employee_profiles ep ON lb.employee_id = ep.id
INNER JOIN users u ON ep.user_id = u.id
INNER JOIN departments d ON ep.department_id = d.id
INNER JOIN leave_types lt ON lb.leave_type_id = lt.id;

-- ============================================================
-- STORED PROCEDURE 1: Apply Leave (with transaction)
-- ============================================================
CREATE OR REPLACE FUNCTION sp_apply_leave(
    p_employee_id INT,
    p_leave_type_id INT,
    p_from_date DATE,
    p_to_date DATE,
    p_total_days INT,
    p_reason TEXT
)
RETURNS TABLE(leave_id INT, message TEXT) AS $$
DECLARE
    v_available INT;
    v_leave_id INT;
    v_year INT;
    v_user_id INT;
BEGIN
    v_year := EXTRACT(YEAR FROM p_from_date);

    -- Check leave balance
    SELECT available_days INTO v_available
    FROM leave_balance
    WHERE employee_id = p_employee_id
      AND leave_type_id = p_leave_type_id
      AND year = v_year;

    IF v_available IS NULL THEN
        RAISE EXCEPTION 'No leave balance found for this leave type and year';
    END IF;

    IF v_available < p_total_days THEN
        RAISE EXCEPTION 'Insufficient leave balance. Available: %, Requested: %', v_available, p_total_days;
    END IF;

    -- Check for overlapping leaves
    IF EXISTS (
        SELECT 1 FROM leave_applications
        WHERE employee_id = p_employee_id
          AND status NOT IN ('manager_rejected', 'hr_rejected', 'cancelled')
          AND (
              (p_from_date BETWEEN from_date AND to_date)
              OR (p_to_date BETWEEN from_date AND to_date)
              OR (from_date BETWEEN p_from_date AND p_to_date)
          )
    ) THEN
        RAISE EXCEPTION 'You already have a leave application for overlapping dates';
    END IF;

    -- Get user_id for audit
    SELECT user_id INTO v_user_id FROM employee_profiles WHERE id = p_employee_id;

    -- Insert leave application
    INSERT INTO leave_applications (employee_id, leave_type_id, from_date, to_date, total_days, reason, status)
    VALUES (p_employee_id, p_leave_type_id, p_from_date, p_to_date, p_total_days, p_reason, 'pending')
    RETURNING id INTO v_leave_id;

    -- Insert audit log
    INSERT INTO approval_history (leave_id, approved_by, role, action, remarks)
    VALUES (v_leave_id, v_user_id, 'employee', 'applied', 'Leave application submitted');

    RETURN QUERY SELECT v_leave_id, 'Leave application submitted successfully'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- STORED PROCEDURE 2: Approve/Reject Leave (with transaction)
-- Uses BEGIN/COMMIT/ROLLBACK via plpgsql exception handling
-- ============================================================
CREATE OR REPLACE FUNCTION sp_approve_leave(
    p_leave_id INT,
    p_approver_id INT,
    p_approver_role VARCHAR(30),
    p_action VARCHAR(50),
    p_remarks TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT) AS $$
DECLARE
    v_current_status VARCHAR(30);
    v_employee_id INT;
    v_leave_type_id INT;
    v_total_days INT;
    v_year INT;
BEGIN
    -- Get current leave details
    SELECT status, employee_id, leave_type_id, total_days, EXTRACT(YEAR FROM from_date)::INT
    INTO v_current_status, v_employee_id, v_leave_type_id, v_total_days, v_year
    FROM leave_applications
    WHERE id = p_leave_id;

    IF v_current_status IS NULL THEN
        RAISE EXCEPTION 'Leave application not found';
    END IF;

    -- Validate workflow: Manager approves pending, HR approves manager_approved
    IF p_approver_role = 'manager' THEN
        IF v_current_status != 'pending' THEN
            RAISE EXCEPTION 'Leave is not in pending status. Current: %', v_current_status;
        END IF;
    ELSIF p_approver_role = 'hr' THEN
        IF v_current_status != 'manager_approved' THEN
            RAISE EXCEPTION 'Leave has not been approved by manager yet. Current: %', v_current_status;
        END IF;
    ELSE
        RAISE EXCEPTION 'Invalid approver role: %', p_approver_role;
    END IF;

    -- Update leave status
    UPDATE leave_applications
    SET status = p_action, updated_at = NOW()
    WHERE id = p_leave_id;

    -- If HR approved (final approval), deduct leave balance
    IF p_action = 'hr_approved' THEN
        UPDATE leave_balance
        SET available_days = available_days - v_total_days
        WHERE employee_id = v_employee_id
          AND leave_type_id = v_leave_type_id
          AND year = v_year;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Failed to update leave balance';
        END IF;
    END IF;

    -- Insert audit log
    INSERT INTO approval_history (leave_id, approved_by, role, action, remarks)
    VALUES (p_leave_id, p_approver_id, p_approver_role, p_action, p_remarks);

    RETURN QUERY SELECT TRUE, ('Leave ' || p_action || ' successfully')::TEXT;

EXCEPTION
    WHEN OTHERS THEN
        -- Transaction auto-rolls back in plpgsql on exception
        RETURN QUERY SELECT FALSE, SQLERRM::TEXT;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- FUNCTION: Initialize leave balance for a new employee
-- ============================================================
CREATE OR REPLACE FUNCTION sp_initialize_leave_balance(p_employee_id INT, p_year INT DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    v_year INT;
BEGIN
    v_year := COALESCE(p_year, EXTRACT(YEAR FROM CURRENT_DATE)::INT);

    INSERT INTO leave_balance (employee_id, leave_type_id, available_days, year)
    SELECT p_employee_id, lt.id, lt.total_days, v_year
    FROM leave_types lt
    ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- DONE
-- ============================================================
-- After running this script, run the following to initialize
-- leave balances for ALL existing employees:
--
-- SELECT sp_initialize_leave_balance(id) FROM employee_profiles;
--
-- ============================================================
