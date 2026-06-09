import React, { useState } from 'react';

export default function Table({ columns, data, loading, emptyMessage = 'No data found', onRowClick, pageSize = 10 }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Normalize columns to support both { key, label, render } and { header, render, accessor } APIs
  const normalizedColumns = (columns || []).map(col => ({
    key: col.key || col.accessor || col.header || '',
    label: col.label || col.header || '',
    render: col.render || null,
    sortable: col.sortable
  }));

  const handleSort = (key) => {
    if (!key) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  let sortedData = [...(data || [])];
  if (sortConfig.key) {
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.key] ?? '';
      const bVal = b[sortConfig.key] ?? '';
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginated = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  if (loading) {
    return (
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr>{normalizedColumns.map((col, i) => <th key={i}>{col.label}</th>)}</tr></thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>{normalizedColumns.map((_, j) => <td key={j}><div className="skeleton-cell" /></td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <div className="table-empty"><span>📋</span><p>{emptyMessage}</p></div>;
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {normalizedColumns.map((col, i) => (
              <th key={i} onClick={() => col.sortable !== false && col.key && handleSort(col.key)} 
                  style={{ cursor: col.sortable !== false && col.key ? 'pointer' : 'default' }}>
                {col.label}
                {sortConfig.key === col.key && (
                  <span className="sort-indicator">{sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginated.map((row, i) => (
            <tr key={row.id || i} onClick={() => onRowClick && onRowClick(row)} 
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}>
              {normalizedColumns.map((col, j) => (
                <td key={j}>
                  {col.render 
                    ? col.render(row, i) 
                    : (col.key ? row[col.key] : '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="table-pagination">
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>← Prev</button>
          <span className="pagination-info">Page {currentPage} of {totalPages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
}
