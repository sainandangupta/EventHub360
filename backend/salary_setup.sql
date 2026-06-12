-- ============================================================
-- SALARY & PAYROLL SYSTEM - Database Setup
-- Run: psql -U postgres -d loginapp -f salary_setup.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS salary_structure (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0,
    hra NUMERIC(12,2) DEFAULT 0,
    allowances NUMERIC(12,2) DEFAULT 0,
    bonus NUMERIC(12,2) DEFAULT 0,
    deductions NUMERIC(12,2) DEFAULT 0,
    tds NUMERIC(12,2) DEFAULT 0,
    pf NUMERIC(12,2) DEFAULT 0,
    esic NUMERIC(12,2) DEFAULT 0,
    net_salary NUMERIC(12,2) DEFAULT 0,
    effective_from DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, effective_from)
);

CREATE TABLE IF NOT EXISTS payroll_runs (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    basic_salary NUMERIC(12,2) DEFAULT 0,
    hra NUMERIC(12,2) DEFAULT 0,
    allowances NUMERIC(12,2) DEFAULT 0,
    bonus NUMERIC(12,2) DEFAULT 0,
    deductions NUMERIC(12,2) DEFAULT 0,
    tds NUMERIC(12,2) DEFAULT 0,
    pf NUMERIC(12,2) DEFAULT 0,
    esic NUMERIC(12,2) DEFAULT 0,
    net_salary NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, month, year)
);

CREATE INDEX IF NOT EXISTS idx_salary_employee ON salary_structure(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll_runs(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_period ON payroll_runs(month, year);

-- View: Salary with employee info
CREATE OR REPLACE VIEW v_salary_details AS
SELECT
    ss.id,
    ss.employee_id,
    u.name AS employee_name,
    u.email,
    d.department_name,
    ep.designation,
    ss.basic_salary,
    ss.hra,
    ss.allowances,
    ss.bonus,
    ss.deductions,
    ss.tds,
    ss.pf,
    ss.esic,
    ss.net_salary,
    ss.effective_from
FROM salary_structure ss
INNER JOIN employee_profiles ep ON ss.employee_id = ep.id
INNER JOIN users u ON ep.user_id = u.id
INNER JOIN departments d ON ep.department_id = d.id;

SELECT 'Salary tables created successfully' AS status;
