import React, { useState, useEffect } from 'react';
import useLeave from '../../hooks/useLeave';
import { Button, Card, Table, Modal, Loader, StatusBadge } from '../../components/ui';

export default function MyLeaves() {
  const { myLeaves, loading, fetchMyLeaves, cancelLeave, getApprovalHistory } = useLeave();
  
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchMyLeaves(statusFilter);
  }, [fetchMyLeaves, statusFilter]);

  const handleViewDetails = async (leave) => {
    setSelectedLeave(leave);
    setModalOpen(true);
    setHistoryLoading(true);
    try {
      const history = await getApprovalHistory(leave.id);
      setApprovalHistory(history || []);
    } catch {
      setApprovalHistory([]);
    }
    setHistoryLoading(false);
  };

  const handleCancel = async (leaveId) => {
    try {
      await cancelLeave(leaveId);
      setActionMessage('Leave cancelled successfully');
      setCancelConfirm(null);
      fetchMyLeaves(statusFilter);
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const columns = [
    { header: '#', render: (row) => row.id },
    { header: 'Leave Type', render: (row) => row.leave_type_name || row.leave_type || '-' },
    { header: 'From', render: (row) => formatDate(row.from_date) },
    { header: 'To', render: (row) => formatDate(row.to_date) },
    { header: 'Days', accessor: 'total_days' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Applied On', render: (row) => formatDate(row.created_at) },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="info" size="sm" onClick={() => handleViewDetails(row)}>
            View
          </Button>
          {row.status === 'pending' && (
            <Button variant="danger" size="sm" onClick={() => setCancelConfirm(row)}>
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">My Leave History</h1>
        <p className="page-subtitle">View and manage all your leave applications</p>
      </div>

      {actionMessage && (
        <div className={`alert ${actionMessage.includes('success') ? 'alert--success' : 'alert--error'}`}>
          {actionMessage}
        </div>
      )}

      <Card>
        <div className="card-header">
          <div className="filter-bar">
            <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
              <select 
                className="form-select" 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="manager_approved">Manager Approved</option>
                <option value="hr_approved">HR Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {myLeaves.length} record(s) found
            </div>
          </div>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <Loader text="Loading leave records..." />
          ) : (
            <Table 
              columns={columns} 
              data={myLeaves} 
              emptyMessage="No leave records found" 
            />
          )}
        </div>
      </Card>

      {/* Leave Details Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedLeave(null); setApprovalHistory([]); }}
        title="Leave Details"
      >
        {selectedLeave && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Leave Type</span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                  {selectedLeave.leave_type_name || selectedLeave.leave_type}
                </p>
              </div>
              <div>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Status</span>
                <p style={{ margin: '0.25rem 0' }}><StatusBadge status={selectedLeave.status} /></p>
              </div>
              <div>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>From Date</span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                  {formatDate(selectedLeave.from_date)}
                </p>
              </div>
              <div>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>To Date</span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                  {formatDate(selectedLeave.to_date)}
                </p>
              </div>
              <div>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Total Days</span>
                <p style={{ fontWeight: 600, color: 'var(--accent-secondary)', margin: '0.25rem 0', fontSize: '1.2rem' }}>
                  {selectedLeave.total_days}
                </p>
              </div>
              <div>
                <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Applied On</span>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
                  {formatDate(selectedLeave.created_at)}
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span className="text-secondary" style={{ fontSize: '0.85rem' }}>Reason</span>
              <p style={{ color: 'var(--text-primary)', margin: '0.25rem 0', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                {selectedLeave.reason || 'No reason provided'}
              </p>
            </div>

            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                📋 Approval Timeline
              </h4>
              {historyLoading ? (
                <Loader text="Loading history..." />
              ) : approvalHistory.length === 0 ? (
                <div className="empty-state" style={{ padding: '1rem' }}>
                  <p>No approval actions yet</p>
                </div>
              ) : (
                <div className="timeline">
                  {approvalHistory.map((step, idx) => (
                    <div className="timeline-item" key={idx}>
                      <div className={`timeline-dot ${
                        step.action?.includes('approved') ? 'timeline-dot--success' : 
                        step.action?.includes('rejected') ? 'timeline-dot--danger' : 'timeline-dot--info'
                      }`}></div>
                      <div className="timeline-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>
                            {step.approver_name || 'System'}
                          </strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {formatDate(step.created_at)}
                          </span>
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          <StatusBadge status={step.action} />
                          {step.role && (
                            <span className="role-badge" style={{ marginLeft: '0.5rem' }}>{step.role}</span>
                          )}
                        </div>
                        {step.remarks && (
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0 0', fontStyle: 'italic' }}>
                            "{step.remarks}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        title="Cancel Leave Request"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setCancelConfirm(null)}>No, Keep It</Button>
            <Button variant="danger" onClick={() => handleCancel(cancelConfirm?.id)}>Yes, Cancel Leave</Button>
          </div>
        }
      >
        <p style={{ color: 'var(--text-primary)' }}>
          Are you sure you want to cancel this leave request?
        </p>
        {cancelConfirm && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius-md)', marginTop: '1rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>
              <strong>Type:</strong> {cancelConfirm.leave_type_name || cancelConfirm.leave_type}
            </p>
            <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>
              <strong>Dates:</strong> {formatDate(cancelConfirm.from_date)} - {formatDate(cancelConfirm.to_date)}
            </p>
            <p style={{ margin: '0.25rem 0', color: 'var(--text-primary)' }}>
              <strong>Days:</strong> {cancelConfirm.total_days}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
