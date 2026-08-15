import React, { useState } from 'react';
import { ColumnMapping, UploadPreview } from '@repo/shared';
import { Columns, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

interface ColumnMapperProps {
  preview: UploadPreview;
  initialMapping: ColumnMapping;
  onBack: () => void;
  onSubmit: (mapping: ColumnMapping) => Promise<void>;
  isLoading: boolean;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  preview,
  initialMapping,
  onBack,
  onSubmit,
  isLoading,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>(initialMapping);
  const [error, setError] = useState<string | null>(null);

  const headers = preview.headers;

  const handleChange = (field: keyof ColumnMapping, val: string) => {
    setMapping((prev) => ({
      ...prev,
      [field]: val === '' ? null : val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!mapping.date || !mapping.description) {
      setError('Date and Description columns are required.');
      return;
    }

    if (!mapping.debit && !mapping.credit) {
      setError('Please map at least one of Debit (Withdrawal) or Credit (Deposit) columns.');
      return;
    }

    try {
      await onSubmit(mapping);
    } catch (err: any) {
      setError(err.message || 'Mapping validation failed.');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '850px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Columns size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.375rem' }}>Match Statement Columns</h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Map columns from <strong>{preview.filename}</strong> to RupeeFlow fields.
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-expense-bg)',
            color: '#fb7185',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Mapping Controls Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="map-date">
              Transaction Date <span style={{ color: 'var(--status-expense)' }}>*</span>
            </label>
            <select
              id="map-date"
              className="form-select"
              value={mapping.date || ''}
              onChange={(e) => handleChange('date', e.target.value)}
              required
            >
              <option value="">-- Select Header --</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="map-desc">
              Description / Narration <span style={{ color: 'var(--status-expense)' }}>*</span>
            </label>
            <select
              id="map-desc"
              className="form-select"
              value={mapping.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            >
              <option value="">-- Select Header --</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Debit */}
          <div className="form-group">
            <label className="form-label" htmlFor="map-debit">
              Debit (Withdrawal / Spend)
            </label>
            <select
              id="map-debit"
              className="form-select"
              value={mapping.debit || ''}
              onChange={(e) => handleChange('debit', e.target.value)}
            >
              <option value="">-- None / Optional --</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Credit */}
          <div className="form-group">
            <label className="form-label" htmlFor="map-credit">
              Credit (Deposit / Income)
            </label>
            <select
              id="map-credit"
              className="form-select"
              value={mapping.credit || ''}
              onChange={(e) => handleChange('credit', e.target.value)}
            >
              <option value="">-- None / Optional --</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>

          {/* Balance */}
          <div className="form-group">
            <label className="form-label" htmlFor="map-balance">
              Closing Balance (Optional)
            </label>
            <select
              id="map-balance"
              className="form-select"
              value={mapping.balance || ''}
              onChange={(e) => handleChange('balance', e.target.value)}
            >
              <option value="">-- None / Optional --</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Sample Row Preview */}
        {preview.sampleRows && preview.sampleRows.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.875rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>
              Raw Statement Preview (First 5 Rows):
            </h4>
            <div className="table-container" style={{ maxHeight: '200px' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    {headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.sampleRows.map((row, idx) => (
                    <tr key={idx}>
                      {headers.map((h) => (
                        <td key={h} style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                          {row[h] || '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onBack}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Parsing Rows...
              </>
            ) : (
              <>
                Review Parsed Rows
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
