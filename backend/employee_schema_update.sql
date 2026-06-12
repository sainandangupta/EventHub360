-- ============================================================
-- EMPLOYEE PROFILE SCHEMA UPDATE
-- Adds city, work_mode, status, joining_date columns
-- Run: psql -U postgres -d loginapp -f employee_schema_update.sql
-- ============================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employee_profiles' AND column_name = 'city') THEN
        ALTER TABLE employee_profiles ADD COLUMN city VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employee_profiles' AND column_name = 'work_mode') THEN
        ALTER TABLE employee_profiles ADD COLUMN work_mode VARCHAR(20) DEFAULT 'offline';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employee_profiles' AND column_name = 'status') THEN
        ALTER TABLE employee_profiles ADD COLUMN status VARCHAR(20) DEFAULT 'active';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'employee_profiles' AND column_name = 'joining_date') THEN
        ALTER TABLE employee_profiles ADD COLUMN joining_date DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_employee_city ON employee_profiles(city);
CREATE INDEX IF NOT EXISTS idx_employee_work_mode ON employee_profiles(work_mode);
CREATE INDEX IF NOT EXISTS idx_employee_status ON employee_profiles(status);

SELECT 'Employee profile schema updated successfully' AS status;
