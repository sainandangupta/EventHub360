import React, { useState, useEffect, useCallback } from 'react';
import useLeave from '../../hooks/useLeave';
import { Card, Table, Loader } from '../../components/ui';

const TABS = [
  { key: 'employee-wise', label: 'Employee Wise', icon: '👤' },
  { key: 'department-wise', label: 'Department Wise', icon: '🏢' },
  { key: 'monthly-trend', label: 'Monthly Trend', icon: '📈' },
  { key: 'most-absent', label: 'Most Absent', icon: '📉' },
  { key: 'leave-balance', label: 'Leave Balance', icon: '💰' },
  { key: 'rankings', label: 'Rankings', icon: '🏆' }
];

const COLUMN_MAP = {
  'employee-wise': [
    { header: 'Employee', render: (r) => r.employee_name || r.name || '-' },
    { header: 'Department', render: (r) => r.department_name || r.department || '-' },
    { header: 'Total Applications', render: (r) => r.total_applications ?? r.total_count ?? '-' },
    { header: 'Total Days', render: (r) => r.total_days ?? '-' },
    { header: 'Approved', render: (r) => r.approved ?? r.approved_count ?? '-' },
    { header: 'Rejected', render: (r) => r.rejected ?? r.rejected_count ?? '-' }
  ],
  'department-wise': [
    { header: 'Department', render: (r) => r.department_name || r.department || '-' },
    { header: 'Total Applications', render: (r) => r.total_applications ?? r.total_count ?? '-' },
    { header: 'Approved Days', render: (r) => r.approved_days ?? '-' },
    { header: 'Pending', render: (r) => r.pending ?? r.pending_count ?? '-' },
    { header: 'Approved', render: (r) => r.approved ?? r.approved_count ?? '-' },
    { header: 'Rejected', render: (r) => r.rejected ?? r.rejected_count ?? '-' }
  ],
  'monthly-trend': [
    { header: 'Month', render: (r) => r.month_name || r.month || '-' },
    { header: 'Applications', render: (r) => r.total_applications ?? r.applications ?? r.total_count ?? '-' },
    { header: 'Approved', render: (r) => r.approved ?? r.approved_count ?? '-' },
    { header: 'Rejected', render: (r) => r.rejected ?? r.rejected_count ?? '-' }
  ],
  'most-absent': [
    { header: 'Rank', render: (r, i) => r.rank ?? (i + 1) },
    { header: 'Employee', render: (r) => r.employee_name || r.name || '-' },
    { header: 'Department', render: (r) => r.department_name || r.department || '-' },
    { header: 'Total Days Absent', render: (r) => r.total_days ?? r.total_absent_days ?? '-' }
  ],
  'leave-balance': [
    { header: 'Employee', render: (r) => r.employee_name || r.name || '-' },
    { header: 'Department', render: (r) => r.department_name || r.department || '-' },
    { header: 'Leave Type', render: (r) => r.leave_type_name || r.leave_type || '-' },
    { header: 'Total', render: (r) => r.total_days ?? r.total ?? '-' },
    { header: 'Used', render: (r) => r.used_days ?? r.used ?? '-' },
    { header: 'Available', render: (r) => r.available_days ?? r.available ?? '-' },
    { header: '% Remaining', render: (r) => {
      const total = r.total_days ?? r.total ?? 0;
      const avail = r.available_days ?? r.available ?? 0;
      const pct = total > 0 ? Math.round((avail / total) * 100) : 0;
      return (
        <span style={{ color: pct > 50 ? 'var(--success)' : pct > 25 ? 'var(--warning)' : 'var(--danger)', fontWeight: 600 }}>
          {pct}%
        </span>
      );
    }}
  ],
  'rankings': [
    { header: 'Rank', render: (r) => r.rank ?? '-' },
    { header: 'Dense Rank', render: (r) => r.dense_rank ?? '-' },
    { header: 'Employee', render: (r) => r.employee_name || r.name || '-' },
    { header: 'Department', render: (r) => r.department_name || r.department || '-' },
    { header: 'Total Days', render: (r) => r.total_days ?? '-' }
  ]
};

export default function LeaveReports() {
  const { getReports } = useLeave();
  const [activeTab, setActiveTab] = useState('employee-wise');
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const loadReport = useCallback(async () => {
    try {
      setTabLoading(true);
      setError('');
      const result = await getReports(activeTab, year);
      setData(Array.isArray(result) ? result : result?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report');
      setData([]);
    } finally {
      setTabLoading(false);
    }
  }, [activeTab, year, getReports]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Leave Reports & Analytics</h1>
        <p className="page-subtitle">Comprehensive leave data analysis and reporting</p>
      </div>

      <Card>
        <div className="card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div className="tabs">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`tab-item ${activeTab === tab.key ? 'tab-item--active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <span style={{ marginRight: '0.4rem' }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: 0, minWidth: '120px' }}>
              <select
                className="form-select"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="alert alert--error">{error}</div>}

          {tabLoading ? (
            <Loader text={`Loading ${TABS.find(t => t.key === activeTab)?.label} report...`} />
          ) : (
            <div style={{ padding: 0 }}>
              <Table
                columns={COLUMN_MAP[activeTab] || []}
                data={data}
                emptyMessage={`No data available for ${TABS.find(t => t.key === activeTab)?.label} report`}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
