import React, { useState, useEffect } from 'react';
import api from '../api';
import FormTable from '../components/ui/FormTable';
import FormInput from '../components/ui/FormInput';
import FormSelect from '../components/ui/FormSelect';

export default function AssetsList() {
  const [assets, setAssets] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    asset_code: '',
    asset_name: '',
    asset_type: '',
    purchase_date: '',
    purchase_cost: ''
  });

  // Allocation State
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [allocationForm, setAllocationForm] = useState({
    employee_id: '',
    return_date: ''
  });

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (user.role || 'user').toLowerCase();
  const isHRorAdmin = ['hr', 'admin'].includes(role);
  const canAllocate = ['manager', 'hr', 'admin'].includes(role);

  const fetchAssets = () => {
    setLoading(true);
    api.get(`/api/assets`, {
      params: { search, status, page, limit },
      headers: { Authorization: token }
    })
      .then(res => {
        setAssets(res.data.data);
        setTotal(res.data.total);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Error fetching assets');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, token]);

  useEffect(() => {
    if (showAllocateModal) {
      // Fetch employee list for allocation dropdown
      api.get('/api/employees', {
        headers: { Authorization: token }
      })
        .then(res => setEmployees(res.data.data || res.data))
        .catch(err => console.error('Error fetching employees:', err));
    }
  }, [showAllocateModal, token]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAssets();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/assets', createForm, {
        headers: { Authorization: token }
      });
      alert('Asset created successfully!');
      setShowCreateModal(false);
      setCreateForm({ asset_code: '', asset_name: '', asset_type: '', purchase_date: '', purchase_cost: '' });
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.errors?.join(', ') || 'Failed to create asset');
    }
  };

  const handleAllocateSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/assets/allocate', {
        asset_id: selectedAsset.id,
        employee_id: parseInt(allocationForm.employee_id),
        return_date: allocationForm.return_date || null
      }, {
        headers: { Authorization: token }
      });
      alert('Asset allocated successfully!');
      setShowAllocateModal(false);
      setAllocationForm({ employee_id: '', return_date: '' });
      fetchAssets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to allocate asset');
    }
  };

  const headers = [
    { label: 'Asset Code', key: 'asset_code', render: (val, row) => <a href={`/assets/${row.id}`} style={{ fontWeight: '700', color: 'var(--color-primary-light)' }}>{val}</a> },
    { label: 'Asset Name', key: 'asset_name' },
    { label: 'Type', key: 'asset_type' },
    { label: 'Status', key: 'status', render: (val) => {
      let color = 'var(--text-secondary)';
      let bg = 'rgba(255, 255, 255, 0.05)';
      if (val === 'Available') { color = '#28a745'; bg = 'rgba(40, 167, 69, 0.1)'; }
      else if (val === 'Allocated') { color = '#fd7e14'; bg = 'rgba(253, 126, 20, 0.1)'; }
      else if (val === 'Damaged') { color = '#dc3545'; bg = 'rgba(220, 53, 69, 0.1)'; }
      else if (val === 'Lost') { color = '#6c757d'; bg = 'rgba(108, 117, 125, 0.1)'; }
      return (
        <span style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', fontWeight: '700', color, backgroundColor: bg, textTransform: 'uppercase' }}>
          {val}
        </span>
      );
    }},
    { label: 'Current User', key: 'current_employee_name', render: (val) => val || <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>None</span> }
  ];

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>📦 Employee Assets Master</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Track corporate laptops, mice, screens, and licenses allocated to teams.</p>
        </div>
        {isHRorAdmin && (
          <button 
            onClick={() => setShowCreateModal(true)} 
            style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--color-primary-light)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer', transition: 'filter 0.2s' }}
          >
            ➕ Register New Asset
          </button>
        )}
      </div>

      {error && <div style={{ color: 'var(--color-danger)', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(220, 53, 69, 0.1)', fontWeight: '600' }}>⚠️ {error}</div>}

      {/* Filter Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--bg-secondary)' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: '450px' }}>
          <FormInput
            placeholder="Search by Code, Name, or Type..."
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ margin: 0, padding: '0.5rem 0.75rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--border-color-light)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontWeight: '600', cursor: 'pointer' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Status Filter:</label>
          <FormSelect
            name="status"
            value={status}
            placeholder="All Statuses"
            options={[
              { value: 'Available', label: 'Available' },
              { value: 'Allocated', label: 'Allocated' },
              { value: 'Returned', label: 'Returned' },
              { value: 'Damaged', label: 'Damaged' },
              { value: 'Lost', label: 'Lost' }
            ]}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            style={{ margin: 0, padding: '0.5rem 2rem 0.5rem 0.75rem', width: '180px' }}
          />
        </div>
      </div>

      {/* Main Table */}
      <FormTable
        headers={headers}
        data={assets}
        loading={loading}
        keyField="id"
        emptyMessage="No assets match the current filters."
        actions={(row) => (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              onClick={() => window.location.href = `/assets/${row.id}`} 
              style={{ padding: '0.375rem 0.75rem', backgroundColor: 'var(--border-color-light)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', cursor: 'pointer' }}
            >
              👁️ View Log
            </button>
            {canAllocate && row.status === 'Available' && (
              <button 
                onClick={() => { setSelectedAsset(row); setShowAllocateModal(true); }} 
                style={{ padding: '0.375rem 0.75rem', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '600' }}
              >
                🤝 Allocate
              </button>
            )}
          </div>
        )}
      />

      {/* Pagination Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> (Total: {total} Assets)
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

      {/* Create Asset Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>➕ Register Asset</h3>
            <form onSubmit={handleCreateSubmit}>
              <FormInput
                label="Asset Code (Unique ID)"
                name="asset_code"
                placeholder="e.g. LAP-0098"
                value={createForm.asset_code}
                onChange={(e) => setCreateForm({ ...createForm, asset_code: e.target.value })}
                required
              />
              <FormInput
                label="Asset Name"
                name="asset_name"
                placeholder="e.g. MacBook Pro M3"
                value={createForm.asset_name}
                onChange={(e) => setCreateForm({ ...createForm, asset_name: e.target.value })}
                required
              />
              <FormSelect
                label="Asset Type"
                name="asset_type"
                placeholder="Select Type"
                options={[
                  { value: 'Laptop', label: 'Laptop' },
                  { value: 'Mouse', label: 'Mouse' },
                  { value: 'Monitor', label: 'Monitor' },
                  { value: 'ID Card', label: 'ID Card' },
                  { value: 'Access Card', label: 'Access Card' },
                  { value: 'Software License', label: 'Software License' }
                ]}
                value={createForm.asset_type}
                onChange={(e) => setCreateForm({ ...createForm, asset_type: e.target.value })}
                required
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <FormInput
                  label="Purchase Date"
                  name="purchase_date"
                  type="date"
                  value={createForm.purchase_date}
                  onChange={(e) => setCreateForm({ ...createForm, purchase_date: e.target.value })}
                />
                <FormInput
                  label="Purchase Cost ($)"
                  name="purchase_cost"
                  type="number"
                  placeholder="e.g. 1500"
                  value={createForm.purchase_cost}
                  onChange={(e) => setCreateForm({ ...createForm, purchase_cost: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--color-primary-light)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer' }}>
                  Register Asset
                </button>
                <button type="button" onClick={() => setShowCreateModal(false)} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allocate Asset Modal */}
      {showAllocateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>🤝 Allocate Asset</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Assigning <strong>{selectedAsset?.asset_name} ({selectedAsset?.asset_code})</strong>.
            </p>
            <form onSubmit={handleAllocateSubmit}>
              <FormSelect
                label="Select Employee"
                name="employee_id"
                placeholder="-- Choose Employee --"
                options={employees.map(emp => ({ value: emp.id, label: `${emp.name} (${emp.designation})` }))}
                value={allocationForm.employee_id}
                onChange={(e) => setAllocationForm({ ...allocationForm, employee_id: e.target.value })}
                required
              />
              <FormInput
                label="Target Return Date (Optional)"
                name="return_date"
                type="date"
                value={allocationForm.return_date}
                onChange={(e) => setAllocationForm({ ...allocationForm, return_date: e.target.value })}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" style={{ flex: 1, padding: '0.5rem', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer' }}>
                  Assign Asset
                </button>
                <button type="button" onClick={() => setShowAllocateModal(false)} style={{ padding: '0.5rem 1rem', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
