import React from 'react';

export default function Button({ 
  children, variant = 'primary', size = 'md', fullWidth = false, 
  loading = false, disabled = false, icon, onClick, type = 'button', className = '' 
}) {
  const classes = [
    'btn', `btn-${variant}`, `btn-${size}`,
    fullWidth && 'btn-full', loading && 'btn-loading', className
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={classes} onClick={onClick} disabled={disabled || loading}>
      {loading && <span className="loader loader-sm" />}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
}
