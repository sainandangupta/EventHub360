import React, { useState, useEffect } from 'react';
import useLeave from '../../hooks/useLeave';
import { Button, Card, Table, Modal, Loader, StatusBadge } from '../../components/ui';

export default function LeaveApprovals() {
  const { pendingApprovals, loading, fetchPendingApprovals, approveLeave } = useLeave();

  const [actionModal, setActionModal] = useState(null); // { leave, action: 'approve'|'reject' }
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManager = user.role === 'manager';
  const isHR = user.role === 'hr';

  useEffect(() => {
    fetchPendingApprovals();
  }, [fetchPendingApprovals]);

  const handleAction = async () => {
    if (!actionModal) return;

    const { leave, action } = actionModal;
    let actionValue;

    if (action === 'approve') {
      actionValue = isManager ? 'manager_approved' : 'hr_approved';
    } else {
      actionValue = isManager ? 'manager_rejected' : 'hr_rejected';
    }

    try {
      setSubmitting(true);
      await approveLeave(leave.id, actionValue, remarks);
      setMessage(`Leave ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      setActionModal(null);
      setRemarks('');
      fetchPendingApprovals();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || `Failed to ${action} leave`);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const columns = [
    { header: 'Employee', render: (row) => (
      <div>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.employee_name || row.name || '-'}</div>
        {row.employee_email && <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.employee_email}</div>}
      </div>
    )},
    { header: 'Department', render: (row) => row.department_name || row.department || '-' },
    { header: 'Leave Type', render: (row) => row.leave_type_name || row.leave_type || '-' },
    { header: 'From', render: (row) => formatDate(row.from_date) },
    { header: 'To', render: (row) => formatDate(row.to_date) },
    { header: 'Days', accessor: 'total_days' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="success" size="sm" onClick={() => setActionModal({ leave: row, action: 'approve' })}>
            ✓ Approve
          </Button>
          <Button variant="danger" size="sm" onClick={() => setActionModal({ leave: row, action: 'reject' })}>
            ✕ Reject
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="page-title">
              {isManager ? 'Pending Manager Approvals' : isHR ? 'Pending HR Approvals' : 'Pending Approvals'}
            </h1>
            <p className="page-subtitle">Review and process leave requests</p>
          </div>
          {pendingApprovals.length > 0 && (
            <div className="badge badge--pending" style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {pendingApprovals.length} pending
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert--success' : 'alert--error'}`}>
          {message}
        </div>
      )}

      <Card>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <Loader text="Loading pending approvals..." />
          ) : pendingApprovals.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
              <h3>All Caught Up!</h3>
              <p>No pending leave requests to review</p>
            </div>
          ) : (
            <Table 
              columns={columns} 
              data={pendingApprovals} 
              emptyMessage="No pending approvals" 
            />
          )}
        </div>
      </Card>

      {/* Approve/Reject Modal */}
      <Modal
        isOpen={!!actionModal}
        onClose={() => { setActionModal(null); setRemarks(''); }}
        title={actionModal?.action === 'approve' ? '✓ Approve Leave' : '✕ Reject Leave'}
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => { setActionModal(null); setRemarks(''); }}>
              Cancel
            </Button>
            <Button 
              variant={actionModal?.action === 'approve' ? 'success' : 'danger'} 
              onClick={handleAction}
              disabled={submitting}
            >
              {submitting ? '⏳ Processing...' : actionModal?.action === 'approve' ? '✓ Confirm Approve' : '✕ Confirm Reject'}
            </Button>
          </div>
        }
      >
        {actionModal && (
          <div>
            <div style={{ 
              padding: '1rem', 
              backgroundColor: actionModal.action === 'approve' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
              borderRadius: 'var(--radius-md)', 
              marginBottom: '1rem',
              border: `1px solid ${actionModal.action === 'approve' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>
                <strong>Employee:</strong> {actionModal.leave.employee_name || actionModal.leave.name}
              </p>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>
                <strong>Leave Type:</strong> {actionModal.leave.leave_type_name || actionModal.leave.leave_type}
              </p>
              <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>
                <strong>Duration:</strong> {formatDate(actionModal.leave.from_date)} - {formatDate(actionModal.leave.to_date)} ({actionModal.leave.total_days} days)
              </p>
              {actionModal.leave.reason && (
                <p style={{ margin: '0.25rem 0', color: 'var(--text-secondary)' }}>
                  <strong>Reason:</strong> {actionModal.leave.reason}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Remarks (optional)</label>
              <textarea
                className="form-textarea"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={`Add your remarks for ${actionModal.action === 'approve' ? 'approval' : 'rejection'}...`}
                rows={3}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
