import React from 'react';

export default function FormInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  ...props
}) {
  return (
    <div className="form-group" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {label && (
        <label htmlFor={name} className="form-label" style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          {label} {required && <span style={{ color: 'var(--color-danger-light)' }}>*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        style={{
          padding: '0.625rem 0.875rem',
          borderRadius: 'var(--radius-md)',
          border: error ? '1px solid var(--color-danger-light)' : '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          width: '100%'
        }}
        {...props}
      />
      {error && (
        <span className="error-feedback" style={{ color: 'var(--color-danger-light)', fontSize: '0.8rem', marginTop: '0.125rem' }}>
          {error}
        </span>
      )}
    </div>
  );
}
