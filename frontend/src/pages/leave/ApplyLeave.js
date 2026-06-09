import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLeave from '../../hooks/useLeave';
import { Button, Card, Loader } from '../../components/ui';

export default function ApplyLeave() {
  const navigate = useNavigate();
  const { leaveTypes, myBalance, fetchLeaveTypes, fetchMyBalance, applyLeave } = useLeave();

  const [formData, setFormData] = useState({
    leave_type_id: '',
    from_date: '',
    to_date: '',
    total_days: 0,
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchLeaveTypes(), fetchMyBalance()]).then(() => setPageLoading(false));
  }, [fetchLeaveTypes, fetchMyBalance]);

  useEffect(() => {
    if (formData.from_date && formData.to_date) {
      const from = new Date(formData.from_date);
      const to = new Date(formData.to_date);
      if (to >= from) {
        const diffTime = to.getTime() - from.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData(prev => ({ ...prev, total_days: diffDays }));
      } else {
        setFormData(prev => ({ ...prev, total_days: 0 }));
      }
    }
  }, [formData.from_date, formData.to_date]);

  const getBalanceForType = (typeId) => {
    const bal = myBalance.find(b => b.leave_type_id === parseInt(typeId));
    return bal ? bal.available_days : null;
  };

  const selectedBalance = formData.leave_type_id ? getBalanceForType(formData.leave_type_id) : null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validate = () => {
    if (!formData.leave_type_id) return 'Please select a leave type';
    if (!formData.from_date) return 'Please select a start date';
    if (!formData.to_date) return 'Please select an end date';
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const from = new Date(formData.from_date);
    
    if (from < today) return 'Start date cannot be in the past';
    if (new Date(formData.to_date) < from) return 'End date must be on or after start date';
    if (formData.total_days <= 0) return 'Invalid date range';
    
    if (selectedBalance !== null && formData.total_days > selectedBalance) {
      return `Insufficient balance. Available: ${selectedBalance} days, Requested: ${formData.total_days} days`;
    }
    
    if (!formData.reason.trim()) return 'Please provide a reason for leave';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await applyLeave({
        leave_type_id: parseInt(formData.leave_type_id),
        from_date: formData.from_date,
        to_date: formData.to_date,
        total_days: formData.total_days,
        reason: formData.reason.trim()
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) return <Loader text="Loading leave types..." />;

  if (success) {
    return (
      <div className="page-container">
        <Card className="success-card">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <h2 className="page-title">Leave Applied Successfully!</h2>
            <p className="text-secondary" style={{ marginBottom: '2rem' }}>
              Your leave application has been submitted and is pending approval.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <Button variant="primary" onClick={() => navigate('/leave/my-leaves')}>
                View My Leaves
              </Button>
              <Button variant="secondary" onClick={() => { setSuccess(false); setFormData({ leave_type_id: '', from_date: '', to_date: '', total_days: 0, reason: '' }); }}>
                Apply Another
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Apply for Leave</h1>
        <p className="page-subtitle">Submit a new leave request for approval</p>
      </div>

      <div className="grid-2">
        <Card>
          <div className="card-header">
            <h3 className="card-title">Leave Application Form</h3>
          </div>
          <div className="card-body">
            {error && <div className="alert alert--error">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Leave Type *</label>
                <select
                  className="form-select"
                  name="leave_type_id"
                  value={formData.leave_type_id}
                  onChange={handleChange}
                >
                  <option value="">-- Select Leave Type --</option>
                  {leaveTypes.map(type => {
                    const bal = getBalanceForType(type.id);
                    return (
                      <option key={type.id} value={type.id}>
                        {type.name} {bal !== null ? `(${bal} days available)` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedBalance !== null && (
                <div className="balance-indicator" style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1rem',
                  backgroundColor: selectedBalance > 5 ? 'rgba(16, 185, 129, 0.1)' : selectedBalance > 0 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `1px solid ${selectedBalance > 5 ? 'var(--success)' : selectedBalance > 0 ? 'var(--warning)' : 'var(--danger)'}`,
                  color: selectedBalance > 5 ? 'var(--success)' : selectedBalance > 0 ? 'var(--warning)' : 'var(--danger)'
                }}>
                  Available Balance: <strong>{selectedBalance} days</strong>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">From Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    name="from_date"
                    value={formData.from_date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">To Date *</label>
                  <input
                    type="date"
                    className="form-input"
                    name="to_date"
                    value={formData.to_date}
                    onChange={handleChange}
                    min={formData.from_date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              {formData.total_days > 0 && (
                <div style={{ 
                  padding: '0.75rem 1rem', 
                  borderRadius: 'var(--radius-md)', 
                  marginBottom: '1rem',
                  backgroundColor: 'rgba(124, 58, 237, 0.1)',
                  border: '1px solid var(--accent-primary)',
                  color: 'var(--accent-secondary)',
                  textAlign: 'center',
                  fontSize: '1.1rem'
                }}>
                  Total Days: <strong>{formData.total_days}</strong>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Reason *</label>
                <textarea
                  className="form-textarea"
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Please provide a reason for your leave request..."
                  rows={4}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? '⏳ Submitting...' : '📝 Submit Application'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </Card>

        <div>
          <Card>
            <div className="card-header">
              <h3 className="card-title">📋 Leave Balance Summary</h3>
            </div>
            <div className="card-body">
              {myBalance.length === 0 ? (
                <div className="empty-state">
                  <p>No balance information available</p>
                </div>
              ) : (
                myBalance.map((bal, idx) => {
                  const total = bal.total_days || 0;
                  const used = bal.used_days || 0;
                  const available = bal.available_days || 0;
                  const percentage = total > 0 ? (available / total) * 100 : 0;
                  const barClass = percentage > 50 ? 'progress-bar--success' : percentage > 25 ? 'progress-bar--warning' : 'progress-bar--danger';
                  
                  return (
                    <div key={idx} style={{ marginBottom: '1.25rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{bal.leave_type_name || bal.name}</span>
                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 700 }}>{available}/{total}</span>
                      </div>
                      <div className="progress-bar-container">
                        <div className={`progress-bar ${barClass}`} style={{ width: `${percentage}%` }}></div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        {used} days used
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
