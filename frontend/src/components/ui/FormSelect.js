import React from 'react';

export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`form-select ${error ? 'is-invalid' : ''}`}
        style={{
          padding: '0.625rem 0.875rem',
          borderRadius: 'var(--radius-md)',
          border: error ? '1px solid var(--color-danger-light)' : '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          fontSize: '0.95rem',
          outline: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          width: '100%'
        }}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span className="error-feedback" style={{ color: 'var(--color-danger-light)', fontSize: '0.8rem', marginTop: '0.125rem' }}>
          {error}
        </span>
      )}
    </div>
  );
}
