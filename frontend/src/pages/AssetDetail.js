import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FormTable from '../components/ui/FormTable';
import FormSelect from '../components/ui/FormSelect';

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Operations
  const [remarks, setRemarks] = useState('');
  const [statusInput, setStatusInput] = useState('');
  const [opLoading, setOpLoading] = useState(false);

  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = (user.role || 'user').toLowerCase();
  const canModify = ['manager', 'hr', 'admin'].includes(role);

  const fetchDetails = () => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/assets/${id}`, {
      headers: { Authorization: token }
    })
      .then(res => {
        setAsset(res.data);
        setStatusInput(res.data.status);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Error loading asset details');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const handleReturn = async () => {
    if (!asset.activeAllocation) return;
    if (!window.confirm('Are you sure you want to log this asset as returned?')) return;
    setOpLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/assets/return/${asset.activeAllocation.id}`,
        { remarks },
        { headers: { Authorization: token } }
      );
      alert('Asset returned successfully!');
      setRemarks('');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process return');
    } finally {
      setOpLoading(false);
    }
  };

  const handleStatusChangeSubmit = async (e) => {
    e.preventDefault();
    if (statusInput === asset.status) return;
    setOpLoading(true);
    try {
      await axios.put(
        `http://localhost:5000/api/assets/status/${asset.id}`,
        { status: statusInput, remarks },
        { headers: { Authorization: token } }
      );
      alert('Asset status updated successfully!');
      setRemarks('');
      fetchDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update asset status');
    } finally {
      setOpLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "80px", textAlign: "center", color: 'var(--text-secondary)' }}>
    <div className="loading-spinner" style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid var(--border-color)', borderTop: '3px solid var(--color-primary-light)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
    <div style={{ marginTop: '0.5rem' }}>Loading asset ledger...</div>
  </div>;

  if (error) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-danger-light)' }}>⚠️ {error}</div>;
  if (!asset) return <div style={{ padding: '40px', textAlign: 'center' }}>Asset not found</div>;

  const historyHeaders = [
    { label: 'Timestamp', key: 'created_at', render: (val) => new Date(val).toLocaleString(), style: { width: '180px' } },
    { label: 'Action Taken', key: 'action', render: (val) => <span style={{ fontWeight: '700' }}>{val}</span>, style: { width: '150px' } },
    { label: 'Log Details', key: 'remarks' },
    { label: 'Performed By', key: 'performed_by_name', style: { width: '150px' } }
  ];

  return (
    <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Back link */}
      <div>
        <button 
          onClick={() => navigate('/assets')} 
          style={{ padding: '0.5rem 1rem', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          ⬅️ Back to Assets Master
        </button>
      </div>

      {/* Grid: Details and Allocation Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Asset Details */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--color-primary-light)', letterSpacing: '0.05em' }}>
              {asset.asset_type} Ledger
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginTop: '0.25rem' }}>{asset.asset_name}</h2>
            <code style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Code: {asset.asset_code}</code>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Purchase Date</div>
              <div style={{ fontWeight: '600' }}>{asset.purchase_date ? new Date(asset.purchase_date).toLocaleDateString() : 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Purchase Cost</div>
              <div style={{ fontWeight: '600' }}>{asset.purchase_cost ? `$${parseFloat(asset.purchase_cost).toLocaleString()}` : 'N/A'}</div>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Status</div>
            <span style={{ padding: '0.5rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'uppercase', 
              color: asset.status === 'Available' ? '#28a745' : asset.status === 'Allocated' ? '#fd7e14' : asset.status === 'Damaged' ? '#dc3545' : '#6c757d',
              backgroundColor: asset.status === 'Available' ? 'rgba(40, 167, 69, 0.1)' : asset.status === 'Allocated' ? 'rgba(253, 126, 20, 0.1)' : asset.status === 'Damaged' ? 'rgba(220, 53, 69, 0.1)' : 'rgba(108, 117, 125, 0.1)'
            }}>
              {asset.status}
            </span>
          </div>
        </div>

        {/* Current Allocation/State Changes */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {asset.status === 'Allocated' && asset.activeAllocation ? (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>🤝 Current Allocation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-primary)', marginBottom: '1.5rem' }}>
                <div>
                  <small style={{ color: 'var(--text-secondary)' }}>Assigned Employee</small>
                  <div style={{ fontWeight: '600' }}>{asset.activeAllocation.employee_name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{asset.activeAllocation.employee_email}</div>
                </div>
                <div>
                  <small style={{ color: 'var(--text-secondary)' }}>Allocation Date</small>
                  <div style={{ fontWeight: '600' }}>{new Date(asset.activeAllocation.allocated_date).toLocaleDateString()}</div>
                </div>
                {asset.activeAllocation.return_date && (
                  <div>
                    <small style={{ color: 'var(--text-secondary)' }}>Target Return Date</small>
                    <div style={{ fontWeight: '600', color: 'var(--color-primary-light)' }}>{new Date(asset.activeAllocation.return_date).toLocaleDateString()}</div>
                  </div>
                )}
              </div>

              {canModify && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Return Remarks / Notes:</label>
                  <textarea
                    rows={2}
                    placeholder="Enter condition notes (e.g. Returned clean, mouse scratch, etc.)..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'none' }}
                  />
                  <button
                    disabled={opLoading}
                    onClick={handleReturn}
                    style={{ padding: '0.75rem', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {opLoading ? 'Processing return...' : '📥 Return Asset to Inventory'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>⚙️ State Configuration</h3>
              {canModify ? (
                <form onSubmit={handleStatusChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <FormSelect
                    label="Adjust Status Manually"
                    name="status"
                    placeholder="Select Status"
                    options={[
                      { value: 'Available', label: 'Available' },
                      { value: 'Damaged', label: 'Damaged' },
                      { value: 'Lost', label: 'Lost' }
                    ]}
                    value={statusInput}
                    onChange={(e) => setStatusInput(e.target.value)}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Remarks for status update:</label>
                    <textarea
                      rows={2}
                      placeholder="Specify why you are modifying status (e.g. Screen broken during commute)..."
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', resize: 'none' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={opLoading || statusInput === asset.status}
                    style={{ padding: '0.75rem', backgroundColor: 'var(--color-primary-light)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '700', cursor: 'pointer', opacity: statusInput === asset.status ? 0.6 : 1 }}
                  >
                    {opLoading ? 'Updating...' : 'Save Configuration'}
                  </button>
                </form>
              ) : (
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Asset is currently not allocated. Only managers, HR, and admins can edit status configurations.
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* History Timeline Logs */}
      <div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>📜 Asset Life-Cycle & Audit Ledger</h3>
        <FormTable
          headers={historyHeaders}
          data={asset.history}
          keyField="id"
          emptyMessage="No historical lifecycle logs recorded."
        />
      </div>

    </div>
  );
}
