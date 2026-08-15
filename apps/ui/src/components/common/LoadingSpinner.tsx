import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 36 : 24;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        gap: '1rem',
        color: 'var(--text-secondary)',
      }}
    >
      <Loader2
        size={iconSize}
        className="animate-spin"
        style={{ color: 'var(--accent-primary)' }}
      />
      {message && (
        <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message}</span>
      )}
    </div>
  );
};
