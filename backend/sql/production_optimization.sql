-- Database Indexes for Query Optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_user_id ON employee_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_department_id ON employee_profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_salary ON employee_profiles(salary);
CREATE INDEX IF NOT EXISTS idx_leave_applications_employee_id ON leave_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_applications_status ON leave_applications(status);
CREATE INDEX IF NOT EXISTS idx_leave_applications_from_date ON leave_applications(from_date);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_asset_code ON assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Database Views
CREATE OR REPLACE VIEW employee_dashboard_view AS
SELECT
  ep.id,
  u.name,
  u.email,
  d.department_name,
  ep.designation,
  ep.salary,
  ep.phone,
  ep.created_at,
  (SELECT COUNT(*) FROM leave_applications la WHERE la.employee_id = ep.id AND la.status = 'pending') AS pending_leaves,
  (SELECT COUNT(*) FROM asset_allocations aa WHERE aa.employee_id = ep.id AND aa.status = 'Allocated') AS allocated_assets
FROM employee_profiles ep
INNER JOIN users u ON ep.user_id = u.id
LEFT JOIN departments d ON ep.department_id = d.id;

CREATE OR REPLACE VIEW leave_summary_view AS
SELECT
  la.id,
  la.employee_id,
  u.name AS employee_name,
  u.email AS employee_email,
  d.department_name,
  lt.leave_name,
  la.from_date,
  la.to_date,
  la.total_days,
  la.status,
  la.reason,
  la.created_at
FROM leave_applications la
JOIN employee_profiles ep ON la.employee_id = ep.id
JOIN users u ON ep.user_id = u.id
LEFT JOIN departments d ON ep.department_id = d.id
JOIN leave_types lt ON la.leave_type_id = lt.id;

CREATE OR REPLACE VIEW asset_summary_view AS
SELECT
  a.id,
  a.asset_code,
  a.asset_name,
  a.asset_type,
  a.status,
  a.purchase_date,
  a.purchase_cost,
  u.name AS assigned_to,
  ep.id AS employee_id,
  al.allocated_date,
  al.return_date
FROM assets a
LEFT JOIN asset_allocations al ON a.id = al.asset_id AND al.status = 'Allocated'
LEFT JOIN employee_profiles ep ON al.employee_id = ep.id
LEFT JOIN users u ON ep.user_id = u.id;

SELECT 'Indexes and views created successfully' AS status;
