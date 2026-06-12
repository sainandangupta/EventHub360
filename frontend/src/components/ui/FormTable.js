import React from 'react';

export default function FormTable({
  headers = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyMessage = 'No records found.',
  actions,
  rowStyle,
  ...props
}) {
  return (
    <div className="table-responsive" style={{ width: '100%', overflowX: 'auto', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)' }} {...props}>
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
        <thead style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '2px solid var(--border-color)' }}>
          <tr>
            {headers.map((header, idx) => {
              const label = typeof header === 'object' ? header.label : header;
              const style = typeof header === 'object' ? header.style : {};
              return (
                <th 
                  key={idx} 
                  style={{ 
                    padding: '1rem 1.25rem', 
                    fontWeight: '600', 
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    letterSpacing: '0.05em',
                    ...style 
                  }}
                >
                  {label}
                </th>
              );
            })}
            {actions && (
              <th 
                style={{ 
                  padding: '1rem 1.25rem', 
                  fontWeight: '600', 
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                  letterSpacing: '0.05em',
                  textAlign: 'right'
                }}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                {headers.map((header, cIdx) => (
                  <td key={cIdx} style={{ padding: '1.25rem 1.25rem' }}>
                    <div 
                      className="skeleton-pulse" 
                      style={{ 
                        height: '1.2rem', 
                        backgroundColor: 'var(--border-color)', 
                        borderRadius: 'var(--radius-sm)',
                        width: cIdx === 0 ? '40%' : cIdx === 1 ? '75%' : '60%',
                        opacity: 0.6,
                        animation: 'pulse 1.5s infinite ease-in-out'
                      }} 
                    />
                  </td>
                ))}
                {actions && (
                  <td style={{ padding: '1.25rem 1.25rem' }}>
                    <div className="skeleton-pulse" style={{ height: '1.8rem', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-sm)', width: '4rem', marginLeft: 'auto', opacity: 0.6, animation: 'pulse 1.5s infinite ease-in-out' }} />
                  </td>
                )}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td 
                colSpan={headers.length + (actions ? 1 : 0)} 
                style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr 
                key={row[keyField] || rowIdx} 
                style={{ 
                  borderBottom: '1px solid var(--border-color)', 
                  transition: 'background-color 0.2s',
                  ...rowStyle
                }}
                className="table-row-hover"
              >
                {headers.map((header, colIdx) => {
                  const key = typeof header === 'object' ? header.key : header;
                  const render = typeof header === 'object' ? header.render : null;
                  const style = typeof header === 'object' ? header.style : {};
                  
                  return (
                    <td key={colIdx} style={{ padding: '1rem 1.25rem', color: 'var(--text-primary)', verticalAlign: 'middle', ...style }}>
                      {render ? render(row[key], row) : row[key] !== undefined ? String(row[key]) : ''}
                    </td>
                  );
                })}
                {actions && (
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {actions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
