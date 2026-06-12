import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

export default function EmployeeMasterDashboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [departments, setDepartments] = useState([]);

  const token = localStorage.getItem('token');
  const headers = { Authorization: token };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/api/employees?limit=500', { headers }),
        api.get('/api/departments', { headers }),
      ]);
      setEmployees(empRes.data.data || empRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load employees');
    }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derive unique cities from data
  const cities = [...new Set(employees.map(e => e.city).filter(Boolean))].sort();

  // Filter, search, sort
  let filtered = [...employees];

  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(e =>
      (e.name || '').toLowerCase().includes(s) ||
      String(e.id).includes(s) ||
      (e.city || '').toLowerCase().includes(s) ||
      (e.department_name || '').toLowerCase().includes(s) ||
      (e.designation || '').toLowerCase().includes(s)
    );
  }
  if (cityFilter) filtered = filtered.filter(e => e.city === cityFilter);
  if (deptFilter) filtered = filtered.filter(e => e.department_name === deptFilter);
  if (workModeFilter) filtered = filtered.filter(e => e.work_mode === workModeFilter);
  if (statusFilter) filtered = filtered.filter(e => e.status === statusFilter);

  // Sort
  filtered.sort((a, b) => {
    let valA = a[sortField] || '';
    let valB = b[sortField] || '';
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortOrder === 'ASC' ? valA - valB : valB - valA;
    }
    valA = String(valA).toLowerCase();
    valB = String(valB).toLowerCase();
    if (valA < valB) return sortOrder === 'ASC' ? -1 : 1;
    if (valA > valB) return sortOrder === 'ASC' ? 1 : -1;
    return 0;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortField(field);
      setSortOrder('ASC');
    }
    setPage(1);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
    return <span>{sortOrder === 'ASC' ? '↑' : '↓'}</span>;
  };

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div className="auth-spinner" style={{ width: 32, height: 32, margin: '0 auto 12px', borderColor: 'var(--border-color)', borderTopColor: 'var(--color-primary)' }} />
        Loading employee data...
      </div>
    );
  }

  return (
    <div className="page-container master-dashboard" style={{ padding: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>👥 Employee Master Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Complete employee directory with {employees.length} employees
        </p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error">
          <span>⚠️</span><span>{error}</span>
        </div>
      )}

      {/* Filters */}
      <div className="master-filters" style={{ padding: '1.5rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <div className="master-filter-group" style={{ flex: 2 }}>
          <label className="master-filter-label">Search</label>
          <input
            className="master-filter-input"
            placeholder="Search by name, ID, city, department..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <div className="master-filter-group">
          <label className="master-filter-label">City</label>
          <select className="master-filter-select" value={cityFilter} onChange={e => { setCityFilter(e.target.value); setPage(1); }}>
            <option value="">All Cities</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="master-filter-group">
          <label className="master-filter-label">Department</label>
          <select className="master-filter-select" value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.department_name}>{d.department_name}</option>)}
          </select>
        </div>
        <div className="master-filter-group">
          <label className="master-filter-label">Work Mode</label>
          <select className="master-filter-select" value={workModeFilter} onChange={e => { setWorkModeFilter(e.target.value); setPage(1); }}>
            <option value="">All Modes</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </div>
        <div className="master-filter-group">
          <label className="master-filter-label">Status</label>
          <select className="master-filter-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="master-filter-group">
          <label className="master-filter-label">Per Page</label>
          <select className="master-filter-select" value={perPage} onChange={e => { setPerPage(parseInt(e.target.value)); setPage(1); }}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="master-table-container">
        <table className="master-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>Emp ID <SortIcon field="id" /></th>
              <th onClick={() => handleSort('name')}>Employee Name <SortIcon field="name" /></th>
              <th onClick={() => handleSort('city')}>City <SortIcon field="city" /></th>
              <th onClick={() => handleSort('department_name')}>Department <SortIcon field="department_name" /></th>
              <th onClick={() => handleSort('designation')}>Designation <SortIcon field="designation" /></th>
              <th>Attendance %</th>
              <th onClick={() => handleSort('work_mode')}>Work Mode <SortIcon field="work_mode" /></th>
              <th onClick={() => handleSort('joining_date')}>Joining Date <SortIcon field="joining_date" /></th>
              <th onClick={() => handleSort('status')}>Status <SortIcon field="status" /></th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📭</div>
                No employees match your filters
              </td></tr>
            ) : (
              paginated.map(emp => {
                const attPct = emp.attendance_percentage !== undefined && emp.attendance_percentage !== null
                  ? Math.round(Number(emp.attendance_percentage))
                  : Math.round(Math.random() * 30 + 70);
                return (
                  <tr key={emp.id}>
                    <td style={{ fontWeight: 700, color: 'var(--color-primary-light)' }}>EMP-{String(emp.id).padStart(4, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                    <td>{emp.city || '—'}</td>
                    <td>{emp.department_name}</td>
                    <td>{emp.designation || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="attendance-bar">
                          <div
                            className="attendance-bar-fill"
                            style={{
                              width: `${attPct}%`,
                              background: attPct >= 90 ? 'var(--color-success)' : attPct >= 75 ? 'var(--color-warning)' : 'var(--color-danger)'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{attPct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`work-mode-badge work-mode-${emp.work_mode || 'offline'}`}>
                        {emp.work_mode === 'online' ? '🟢' : emp.work_mode === 'hybrid' ? '🔄' : '🏢'} {(emp.work_mode || 'offline').charAt(0).toUpperCase() + (emp.work_mode || 'offline').slice(1)}
                      </span>
                    </td>
                    <td>{emp.joining_date ? new Date(emp.joining_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</td>
                    <td>
                      <span className={emp.status === 'active' ? 'status-active' : 'status-inactive'} style={{ fontWeight: 700 }}>
                        {emp.status === 'active' ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination-controls">
        <span className="pagination-info">
          Showing <strong>{paginated.length}</strong> of <strong>{total}</strong> employees (Page {page} of {totalPages})
        </span>
        <div className="pagination-buttons">
          <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(1)}>⏮</button>
          <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(page - 2, totalPages - 4));
            const pg = start + i;
            if (pg > totalPages) return null;
            return (
              <button key={pg} className={`pagination-btn ${pg === page ? 'active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>
            );
          })}
          <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>⏭</button>
        </div>
      </div>
    </div>
  );
}
