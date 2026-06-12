-- ============================================================
-- ATTENDANCE TRACKING SYSTEM - Database Setup
-- Run: psql -U postgres -d loginapp -f attendance_setup.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS attendance_records (
    id SERIAL PRIMARY KEY,
    employee_id INT NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    status VARCHAR(20) DEFAULT 'present',
    work_hours NUMERIC(4,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(employee_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance_records(status);

-- View: Attendance summary with employee details
CREATE OR REPLACE VIEW v_attendance_summary AS
SELECT
    ar.id,
    ar.employee_id,
    u.name AS employee_name,
    u.email,
    d.department_name,
    ar.date,
    ar.check_in,
    ar.check_out,
    ar.status,
    ar.work_hours,
    ar.notes
FROM attendance_records ar
INNER JOIN employee_profiles ep ON ar.employee_id = ep.id
INNER JOIN users u ON ep.user_id = u.id
INNER JOIN departments d ON ep.department_id = d.id;

SELECT 'Attendance tables created successfully' AS status;
