import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormTable from '../components/ui/FormTable';
import FormSelect from '../components/ui/FormSelect';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [tableName, setTableName] = useState('');
  const [actionType, setActionType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  const token = localStorage.getItem('token');

  const fetchLogs = () => {
    setLoading(true);
    axios.get('http://localhost:5000/api/audit-logs', {
      params: { tableName, actionType, page, limit },
      headers: { Authorization: token }
    })
      .then(res => {
        setLogs(res.data.data);
        setTotal(res.data.total);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Error fetching audit logs');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tableName, actionType, token]);

  const toggleExpandLog = (id) => {
    if (expandedLogId === id) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(id);
    }
  };

  // Helper to highlight key-value diffs between JSON objects
  const renderJSONDiff = (oldData, newData) => {
    if (!oldData && !newData) return <span>No data details available.</span>;

    const allKeys = Array.from(new Set([
      ...Object.keys(oldData || {}),
      ...Object.keys(newData || {})
    ]));

    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
        
        {/* Old State */}
        <div>
          <div style={{ fontWeight: '700', color: 'var(--color-danger-light)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>Old Value</div>
          {oldData ? (
            allKeys.map(k => {
              const hasChanged = JSON.stringify(oldData[k]) !== JSON.stringify(newData?.[k]);
              if (oldData[k] === undefined) return null;
              return (
                <div key={k} style={{ marginBottom: '0.25rem', textDecoration: hasChanged ? 'line-through' : 'none', color: hasChanged ? 'var(--color-danger-light)' : 'var(--text-secondary)' }}>
                  <strong>{k}:</strong> {JSON.stringify(oldData[k])}
                </div>
              );
            })
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>Empty (Insert Flow)</span>
          )}
        </div>

        {/* Action arrow */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'var(--text-secondary)' }}>
          ➡️
        </div>

        {/* New State */}
        <div>
          <div style={{ fontWeight: '700', color: 'var(--color-primary-light)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem', marginBottom: '0.5rem' }}>New Value</div>
          {newData ? (
            allKeys.map(k => {
              const hasChanged = JSON.stringify(oldData?.[k]) !== JSON.stringify(newData[k]);
              if (newData[k] === undefined) return null;
              return (
                <div key={k} style={{ marginBottom: '0.25rem', fontWeight: hasChanged ? '700' : 'normal', color: hasChanged ? 'var(--color-primary-light)' : 'var(--text-primary)' }}>
                  <strong>{k}:</strong> {JSON.stringify(newData[k])}
                </div>
              );
            })
          ) : (
            <span style={{ color: 'var(--text-secondary)' }}>Deleted (Delete Flow)</span>
          )}
        </div>

      </div>
    );
  };

  const headers = [
    { label: 'Timestamp', key: 'created_at', render: (val) => new Date(val).toLocaleString(), style: { width: '180px' } },
    { label: 'Table Name', key: 'table_name', render: (val) => <code style={{ backgroundColor: 'var(--bg-primary)', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>{val}</code>, style: { width: '150px' } },
    { label: 'Action', key: 'action_type', render: (val) => {
      let color = 'var(--text-primary)';
      if (val === 'INSERT') color = '#28a745';
      else if (val === 'UPDATE') color = '#007bff';
      else if (val === 'DELETE') color = '#dc3545';
      return <span style={{ fontWeight: '800', color }}>{val}</span>;
    }, style: { width: '100px' } },
    { label: 'Record ID', key: 'record_id', style: { width: '90px' } },
    { label: 'Performed By', key: 'performed_by_name', render: (val, row) => val ? `${val} (${row.performed_by_email})` : <span style={{ color: 'var(--text-secondary)' }}>System/Unknown</span> }
  ];

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>🔑 Database Audit Trail</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Track all modifications, salary changes, and asset life-cycle updates with old vs new state comparisons.</p>
      </div>

      {/* Toolbar Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Table:</label>
          <FormSelect
            name="tableName"
            value={tableName}
            placeholder="All Tables"
            options={[
              { value: 'users', label: 'users' },
              { value: 'employee_profiles', label: 'employee_profiles' },
              { value: 'assets', label: 'assets' },
              { value: 'asset_allocations', label: 'asset_allocations' },
              { value: 'leave_applications', label: 'leave_applications' }
            ]}
            onChange={(e) => { setTableName(e.target.value); setPage(1); }}
            style={{ margin: 0, padding: '0.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '220px' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Action:</label>
          <FormSelect
            name="actionType"
            value={actionType}
            placeholder="All Actions"
            options={[
              { value: 'INSERT', label: 'INSERT (Create)' },
              { value: 'UPDATE', label: 'UPDATE (Modify)' },
              { value: 'DELETE', label: 'DELETE (Remove)' }
            ]}
            onChange={(e) => { setActionType(e.target.value); setPage(1); }}
            style={{ margin: 0, padding: '0.5rem' }}
          />
        </div>

      </div>

      {/* Main Grid */}
      {error && <div style={{ color: 'var(--color-danger-light)' }}>⚠️ {error}</div>}

      <FormTable
        headers={headers}
        data={logs}
        loading={loading}
        keyField="id"
        emptyMessage="No audit logs match these criteria."
        actions={(row) => (
          <button 
            onClick={() => toggleExpandLog(row.id)} 
            style={{ padding: '0.375rem 0.75rem', backgroundColor: 'var(--border-color-light)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}
          >
            {expandedLogId === row.id ? 'Hide Diff' : 'Show Diff 🔍'}
          </button>
        )}
        rowStyle={{ cursor: 'pointer' }}
      />

      {/* Expanded Diff Block */}
      {expandedLogId !== null && (
        (() => {
          const matchedLog = logs.find(l => l.id === expandedLogId);
          if (!matchedLog) return null;
          return (
            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', marginTop: '-1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h4 style={{ fontWeight: '700' }}>JSONB Data Comparison (Log #{matchedLog.id})</h4>
                <button onClick={() => setExpandedLogId(null)} style={{ border: 'none', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>Close ✖</button>
              </div>
              {renderJSONDiff(matchedLog.old_data, matchedLog.new_data)}
            </div>
          );
        })()
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total: {total} Logs)
        </span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            disabled={page <= 1} 
            onClick={() => setPage(page - 1)} 
            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', backgroundColor: page <= 1 ? 'transparent' : 'var(--bg-secondary)', color: page <= 1 ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setPage(page + 1)} 
            style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', backgroundColor: page >= totalPages ? 'transparent' : 'var(--bg-secondary)', color: page >= totalPages ? 'var(--text-secondary)' : 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
