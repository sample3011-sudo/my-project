import React from 'react';
import { UploadMalformedData } from '@repo/shared';
import { CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

interface MalformedPreviewProps {
  data: UploadMalformedData;
  onToggleRow: (rowIndex: number) => Promise<void>;
  onBack: () => void;
  onCommit: () => Promise<void>;
  isLoading: boolean;
}

export const MalformedPreview: React.FC<MalformedPreviewProps> = ({
  data,
  onToggleRow,
  onBack,
  onCommit,
  isLoading,
}) => {
  const { summary, malformedRows } = data;
  const excludedCount = malformedRows.filter((r) => r.excluded).length;
  const includedCount = summary.totalRows - excludedCount;

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.375rem', marginBottom: '0.25rem' }}>Statement Normalization Review</h2>
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          Review rows parsed from your statement. Clean rows will be categorized and deduplicated automatically.
        </p>
      </div>

      {/* Summary Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
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
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ROWS</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{summary.totalRows}</div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-income-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--status-income)', fontWeight: 600 }}>CLEAN & READY</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-income)' }}>
            {summary.cleanRows}
          </div>
        </div>

        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: summary.malformedRows > 0 ? 'var(--status-warning-bg)' : 'rgba(255, 255, 255, 0.03)',
            border: summary.malformedRows > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '0.75rem', color: summary.malformedRows > 0 ? 'var(--status-warning)' : 'var(--text-muted)', fontWeight: 600 }}>
            FLAGGED / REVIEW
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: summary.malformedRows > 0 ? 'var(--status-warning)' : 'var(--text-primary)' }}>
            {summary.malformedRows}
          </div>
        </div>
      </div>

      {/* Flagged Rows Review Table (if any) */}
      {malformedRows.length > 0 ? (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <AlertTriangle size={18} style={{ color: 'var(--status-warning)' }} />
            <h4 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
              Flagged Rows ({malformedRows.length})
            </h4>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              (Uncheck to exclude from import)
            </span>
          </div>

          <div className="table-container" style={{ maxHeight: '280px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Include?</th>
                  <th style={{ width: '90px' }}>Row #</th>
                  <th>Flag Reasons</th>
                  <th>Raw Data</th>
                </tr>
              </thead>
              <tbody>
                {malformedRows.map((row) => (
                  <tr key={row.rowIndex} style={{ opacity: row.excluded ? 0.4 : 1 }}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!row.excluded}
                        onChange={() => onToggleRow(row.rowIndex)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                      />
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                      #{row.rowIndex + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {row.reasons.map((r, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.6875rem',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'rgba(244, 63, 94, 0.2)',
                              color: '#fb7185',
                            }}
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {Object.entries(row.rawData)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' | ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-income-bg)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: 'var(--status-income)',
            marginBottom: '2rem',
          }}
        >
          <CheckCircle2 size={24} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>100% Clean Rows!</div>
            <div style={{ fontSize: '0.8125rem' }}>
              All {summary.totalRows} rows were normalized successfully with zero parse errors.
            </div>
          </div>
        </div>
      )}

      {/* Commit Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onBack}
          className="btn btn-secondary"
          disabled={isLoading}
        >
          <ArrowLeft size={16} />
          Change Mapping
        </button>

        <button
          type="button"
          onClick={onCommit}
          className="btn btn-primary"
          disabled={isLoading || includedCount === 0}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Deduplicating & Auto-Categorizing...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Commit Import ({includedCount} Rows)
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
