import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLeave from '../../hooks/useLeave';
import { Button, Card, Loader } from '../../components/ui';

export default function LeaveBalance() {
  const navigate = useNavigate();
  const { myBalance, fetchMyBalance } = useLeave();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetchMyBalance().then(() => setPageLoading(false));
  }, [fetchMyBalance]);

  const getIcon = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('sick')) return '🏥';
    if (n.includes('casual')) return '🌴';
    if (n.includes('earned') || n.includes('privilege')) return '⭐';
    if (n.includes('maternity')) return '👶';
    if (n.includes('paternity')) return '👨‍👦';
    if (n.includes('compensatory') || n.includes('comp')) return '⏰';
    if (n.includes('unpaid') || n.includes('loss')) return '📋';
    return '📅';
  };

  if (pageLoading) return <Loader text="Loading balance..." />;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-title">My Leave Balance</h1>
            <p className="page-subtitle">Leave allocation for {new Date().getFullYear()}</p>
          </div>
          <Button variant="primary" onClick={() => navigate('/leave/apply')}>
            ✚ Apply Leave
          </Button>
        </div>
      </div>

      {myBalance.length === 0 ? (
        <Card>
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
            <h3>No Balance Data</h3>
            <p>Leave balance information is not available yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid-3">
          {myBalance.map((bal, idx) => {
            const total = bal.total_days || 0;
            const used = bal.used_days || 0;
            const available = bal.available_days ?? (total - used);
            const percentage = total > 0 ? (available / total) * 100 : 0;
            const barClass = percentage > 50 ? 'progress-bar--success' : percentage > 25 ? 'progress-bar--warning' : 'progress-bar--danger';
            const colorVar = percentage > 50 ? 'var(--success)' : percentage > 25 ? 'var(--warning)' : 'var(--danger)';

            return (
              <Card key={idx} className="balance-card">
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {getIcon(bal.leave_type_name || bal.name)}
                      </div>
                      <h3 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                        {bal.leave_type_name || bal.name}
                      </h3>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '2.5rem', fontWeight: 800, color: colorVar, lineHeight: 1 }}>
                        {available}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginLeft: '0.25rem' }}>
                        / {total}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>days</span>
                  </div>

                  <div className="progress-bar-container" style={{ marginBottom: '0.75rem' }}>
                    <div className={`progress-bar ${barClass}`} style={{ width: `${percentage}%` }}></div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>{used} used</span>
                    <span>{Math.round(percentage)}% remaining</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
