import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommitResult } from '@repo/shared';
import { CheckCircle, LayoutDashboard, Receipt, RefreshCw, Sparkles, Copy } from 'lucide-react';

interface ImportSummaryModalProps {
  result: CommitResult;
  onUploadAnother: () => void;
}

export const ImportSummaryModal: React.FC<ImportSummaryModalProps> = ({
  result,
  onUploadAnother,
}) => {
  const navigate = useNavigate();

  return (
    <div className="glass-panel" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--status-income-bg)',
          color: 'var(--status-income)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)',
        }}
      >
        <CheckCircle size={36} />
      </div>

      <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Import Completed Successfully!</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '2rem' }}>
        Transactions have been normalized, deduplicated, and categorized into your ledger.
      </p>

      {/* Stats Breakdown Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          marginBottom: '2rem',
          textAlign: 'left',
        }}
      >
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>NEW TRANSACTIONS ADDED</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-income)' }}>
            {result.rowsImported}
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Copy size={12} />
            DUPLICATES SKIPPED
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {result.rowsDuplicate}
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent-primary)' }}>
            <Sparkles size={12} />
            AI CATEGORIZED
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
            {result.aiCategorized}
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RULE CACHE HITS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {result.cacheHits}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
        <button
          onClick={() => navigate('/')}
          className="btn btn-primary"
          style={{ padding: '0.75rem 1.5rem' }}
        >
          <LayoutDashboard size={16} />
          View Dashboard
        </button>

        <button
          onClick={() => navigate('/ledger')}
          className="btn btn-secondary"
          style={{ padding: '0.75rem 1.5rem' }}
        >
          <Receipt size={16} />
          View in Ledger
        </button>

        <button
          onClick={onUploadAnother}
          className="btn btn-ghost"
          style={{ padding: '0.75rem 1.25rem' }}
        >
          <RefreshCw size={16} />
          Upload Another
        </button>
      </div>
    </div>
  );
};
