import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useImports } from '../hooks/useImports';
import { formatDate } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { EmptyState } from '../components/common/EmptyState';
import { Modal } from '../components/common/Modal';
import { History, Trash2, UploadCloud, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ImportRecord } from '@repo/shared';

export const ImportsPage: React.FC = () => {
  const { items, isLoading, error, isEmpty, rollback, refetch } = useImports();
  const [selectedForRollback, setSelectedForRollback] = useState<ImportRecord | null>(null);
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleConfirmRollback = async () => {
    if (!selectedForRollback) return;
    setIsRollingBack(true);
    try {
      await rollback(selectedForRollback.id);
      setSelectedForRollback(null);
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <History size={20} style={{ color: 'var(--accent-primary)' }} />
            <h1 style={{ fontSize: '1.75rem' }}>Import Batches</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Statement upload history with one-click atomic batch rollback
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="btn btn-primary"
          style={{ padding: '0.625rem 1rem' }}
        >
          <UploadCloud size={16} />
          Upload New Statement
        </button>
      </div>

      {/* Error state */}
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Loading state */}
      {isLoading ? (
        <LoadingSpinner message="Loading import batch history..." size="lg" />
      ) : isEmpty ? (
        /* Empty state */
        <EmptyState
          title="No Import Batches Yet"
          description="You have not uploaded any bank statements yet. Upload your first statement to populate transactions."
          action={{
            label: 'Upload Bank Statement',
            onClick: () => navigate('/upload'),
          }}
        />
      ) : (
        /* Success state */
        <div className="table-container glass-panel">
          <table className="data-table">
            <thead>
              <tr>
                <th>Statement File</th>
                <th>Bank</th>
                <th>Statement Period</th>
                <th style={{ textAlign: 'right' }}>Total Rows</th>
                <th style={{ textAlign: 'right' }}>Imported</th>
                <th style={{ textAlign: 'right' }}>Duplicates</th>
                <th>Import Date</th>
                <th style={{ textAlign: 'center', width: '100px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((imp) => (
                <tr key={imp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                      <FileSpreadsheet size={16} style={{ color: 'var(--accent-primary)' }} />
                      <span>{imp.filename}</span>
                    </div>
                  </td>
                  <td>{imp.bankName || '—'}</td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {imp.periodStart && imp.periodEnd
                      ? `${formatDate(imp.periodStart)} – ${formatDate(imp.periodEnd)}`
                      : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>{imp.rowsTotal}</td>
                  <td style={{ textAlign: 'right', color: 'var(--status-income)', fontWeight: 700 }}>
                    {imp.rowsImported}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                    {imp.rowsDuplicate}
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    {formatDate(imp.createdAt)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedForRollback(imp)}
                      className="btn btn-danger"
                      style={{ padding: '0.35rem 0.625rem', fontSize: '0.75rem' }}
                      title="Rollback this entire batch"
                    >
                      <Trash2 size={13} />
                      Rollback
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rollback Confirmation Modal */}
      {selectedForRollback && (
        <Modal
          isOpen={Boolean(selectedForRollback)}
          onClose={() => setSelectedForRollback(null)}
          title="Confirm Batch Rollback"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Are you sure you want to rollback the import for{' '}
              <strong>{selectedForRollback.filename}</strong>?
            </p>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-expense-bg)',
                color: '#fb7185',
                fontSize: '0.8125rem',
              }}
            >
              ⚠️ This will delete all <strong>{selectedForRollback.rowsImported} transactions</strong> imported from this file. This action cannot be undone.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setSelectedForRollback(null)}
                className="btn btn-secondary"
                disabled={isRollingBack}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRollback}
                className="btn btn-danger"
                disabled={isRollingBack}
              >
                {isRollingBack ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Rolling Back...
                  </>
                ) : (
                  'Yes, Delete Batch'
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
