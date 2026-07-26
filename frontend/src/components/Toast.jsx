import React from 'react';
import { useToast } from '../context/ToastContext.jsx';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  const iconMap = {
    success: 'ti-circle-check',
    error: 'ti-circle-x',
    info: 'ti-info-circle',
  };

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-item toast-${t.type}`}>
          <i className={`ti ${iconMap[t.type] || iconMap.success}`} />
          <span style={{ flex: 1 }}>{t.message}</span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: 'none', border: 'none', color: 'inherit',
              cursor: 'pointer', fontSize: 16, opacity: 0.7, lineHeight: 1,
            }}
          >
            <i className="ti ti-x" />
          </button>
        </div>
      ))}
    </div>
  );
}
