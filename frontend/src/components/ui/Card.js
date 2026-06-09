import React from 'react';

export default function Card({ children, title, subtitle, icon, accentColor, onClick, className = '' }) {
  const style = accentColor ? { borderLeft: `4px solid ${accentColor}` } : {};
  return (
    <div className={`card ${onClick ? 'card-clickable' : ''} ${className}`} style={style} onClick={onClick}>
      {(title || icon) && (
        <div className="card-header">
          {icon && <span className="card-icon">{icon}</span>}
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="card-body">{children}</div>
    </div>
  );
}

export function StatCard({ icon, title, value, subtitle, color }) {
  return (
    <div className="stat-card" style={{ '--accent-color': color || 'var(--color-primary)' }}>
      <div className="stat-card-icon">{icon}</div>
      <div className="stat-card-content">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-title">{title}</span>
        {subtitle && <span className="stat-card-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}
