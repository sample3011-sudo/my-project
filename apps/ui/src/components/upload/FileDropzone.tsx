import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Building2, Loader2 } from 'lucide-react';
import { BankPreset } from '@repo/shared';

interface FileDropzoneProps {
  onUpload: (file: File, bankName?: string) => Promise<void>;
  presets: BankPreset[];
  isLoading: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onUpload,
  presets,
  isLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [bankName, setBankName] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError(null);
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.csv') && !lower.endsWith('.xlsx') && !lower.endsWith('.xls')) {
      setError('Please upload a valid CSV or Excel (.xlsx, .xls) bank statement.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a statement file.');
      return;
    }
    try {
      await onUpload(selectedFile, bankName.trim() || undefined);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '2rem', maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Upload Bank Statement</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Upload your bank statement (CSV or Excel) to automatically normalize, deduplicate, and categorize expenses.
        </p>
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
        {/* Dropzone Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: isDragOver
              ? '2px dashed var(--accent-primary)'
              : '2px dashed var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '1.5rem',
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept=".csv, .xlsx, .xls"
            style={{ display: 'none' }}
          />

          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              color: 'var(--accent-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}
          >
            {selectedFile ? <FileSpreadsheet size={28} /> : <UploadCloud size={28} />}
          </div>

          {selectedFile ? (
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: '0.25rem' }}>
                {selectedFile.name}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB — Click or drop another file to replace
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9375rem', marginBottom: '0.25rem' }}>
                Click to browse or drag and drop your file here
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Supports CSV, XLSX, XLS files up to 10 MB
              </div>
            </div>
          )}
        </div>

        {/* Bank Preset Selection */}
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" htmlFor="bank-name">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={14} />
              Bank Name / Preset (Optional)
            </div>
          </label>
          <input
            id="bank-name"
            type="text"
            className="form-input"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="e.g. HDFC Bank, ICICI, SBI"
            list="bank-presets"
            style={{ width: '100%' }}
          />
          <datalist id="bank-presets">
            {presets.map((p) => (
              <option key={p.id} value={p.bankName} />
            ))}
          </datalist>
        </div>

        <button
          type="submit"
          disabled={!selectedFile || isLoading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.875rem' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Reading & Uploading Statement...
            </>
          ) : (
            'Continue to Column Mapping →'
          )}
        </button>
      </form>
    </div>
  );
};
