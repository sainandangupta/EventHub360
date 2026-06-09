import React from 'react';

const statusLabels = {
  pending: 'Pending',
  manager_approved: 'Manager Approved',
  manager_rejected: 'Manager Rejected',
  hr_approved: 'Approved',
  hr_rejected: 'HR Rejected',
  cancelled: 'Cancelled',
  applied: 'Applied'
};

export default function StatusBadge({ status }) {
  const label = statusLabels[status] || status;
  return <span className={`status-badge badge-${status}`}>{label}</span>;
}
