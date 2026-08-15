import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--status-expense-bg)',
        border: '1px solid rgba(244, 63, 94, 0.3)',
        color: '#f87171',
        marginBottom: '1.5rem',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertCircle size={20} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-secondary"
          style={{
            padding: '0.4rem 0.8rem',
            fontSize: '0.8125rem',
            backgroundColor: 'rgba(244, 63, 94, 0.2)',
            borderColor: 'rgba(244, 63, 94, 0.4)',
          }}
        >
          <RefreshCw size={14} />
          Retry
        </button>
      )}
    </div>
  );
};
