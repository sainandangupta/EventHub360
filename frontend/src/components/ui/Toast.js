import React, { useState, useEffect, useCallback } from 'react';

const TOAST_DURATION = 4000;

const icons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
};

let toastId = 0;
const listeners = new Set();

// Global API — call from anywhere: showToast({ message, type })
export function showToast({ message, type = 'info', duration = TOAST_DURATION }) {
  const id = ++toastId;
  listeners.forEach((fn) => fn({ id, message, type, duration }));
}

function ToastItem({ toast, onRemove }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onRemove(toast.id), 350);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast, onRemove]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 350);
  };

  return (
    <div
      className={`toast-item toast-${toast.type} ${exiting ? 'toast-exit' : 'toast-enter'}`}
      role="alert"
    >
      <span className="toast-icon">{icons[toast.type] || icons.info}</span>
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={handleClose} aria-label="Close notification">
        ×
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    setToasts((prev) => [...prev.slice(-4), toast]); // keep max 5
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => listeners.delete(addToast);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}
