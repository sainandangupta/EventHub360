-- ============================================================
-- EMPLOYEE ASSET MANAGEMENT & WORKFLOW - Database Setup
-- Run: psql -U postgres -d loginapp -f assets_setup.sql
-- ============================================================

-- Table 1: Assets Master
CREATE TABLE IF NOT EXISTS assets (
    id SERIAL PRIMARY KEY,
    asset_code VARCHAR(50) UNIQUE NOT NULL,
    asset_name VARCHAR(200) NOT NULL,
    asset_type VARCHAR(100) NOT NULL,
    purchase_date DATE,
    purchase_cost NUMERIC(12,2),
    status VARCHAR(50) DEFAULT 'Available'
);

-- Table 2: Asset Allocations
CREATE TABLE IF NOT EXISTS asset_allocations (
    id SERIAL PRIMARY KEY,
    asset_id INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    employee_id INT NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    allocated_by INT NOT NULL REFERENCES users(id),
    allocated_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE,
    status VARCHAR(50) DEFAULT 'Allocated'
);

-- Table 3: Asset History
CREATE TABLE IF NOT EXISTS asset_history (
    id SERIAL PRIMARY KEY,
    asset_id INT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    remarks TEXT,
    created_by INT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Notification Engine
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: Audit Trail (JSONB)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    performed_by INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index audit logs for performance since they can grow large
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

-- View 1: employee_summary (from users, profiles, departments)
CREATE OR REPLACE VIEW employee_summary AS
SELECT
    u.name,
    d.department_name,
    ep.designation
FROM users u
JOIN employee_profiles ep ON u.id = ep.user_id
JOIN departments d ON d.id = ep.department_id;

-- Stored Procedure / Function 1: calculate_leave_balance
CREATE OR REPLACE FUNCTION calculate_leave_balance(
    p_employee_id INT,
    p_leave_type_id INT,
    p_year INT
)
RETURNS INT AS $$
DECLARE
    v_total_days INT;
    v_taken_days INT;
BEGIN
    -- Get total days allocated for the leave type
    SELECT total_days INTO v_total_days
    FROM leave_types
    WHERE id = p_leave_type_id;

    IF v_total_days IS NULL THEN
        RETURN 0;
    END IF;

    -- Get total approved leaves taken
    SELECT COALESCE(SUM(total_days), 0) INTO v_taken_days
    FROM leave_applications
    WHERE employee_id = p_employee_id
      AND leave_type_id = p_leave_type_id
      AND status = 'hr_approved'
      AND EXTRACT(YEAR FROM from_date) = p_year;

    RETURN GREATEST(0, v_total_days - v_taken_days);
END;
$$ LANGUAGE plpgsql;
