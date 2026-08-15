import React from 'react';
import { useUpload } from '../hooks/useUpload';
import { FileDropzone } from '../components/upload/FileDropzone';
import { ColumnMapper } from '../components/upload/ColumnMapper';
import { MalformedPreview } from '../components/upload/MalformedPreview';
import { ImportSummaryModal } from '../components/upload/ImportSummaryModal';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

export const UploadPage: React.FC = () => {
  const {
    step,
    setStep,
    preview,
    mapping,
    malformedData,
    commitResult,
    presets,
    isLoading,
    error,
    uploadStatement,
    submitMapping,
    toggleMalformedRow,
    commitImport,
    resetWizard,
  } = useUpload();

  const stepsList = [
    { key: 'upload', title: '1. Select File' },
    { key: 'mapping', title: '2. Column Mapping' },
    { key: 'review', title: '3. Normalize & Review' },
    { key: 'success', title: '4. Summary' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Wizard Progress Bar */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          {stepsList.map((s, idx) => {
            const isCurrent = step === s.key;
            const isCompleted =
              (step === 'mapping' && idx === 0) ||
              (step === 'review' && idx <= 1) ||
              (step === 'success' && idx <= 2);

            return (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.8125rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent
                    ? 'var(--accent-primary)'
                    : isCompleted
                    ? 'var(--status-income)'
                    : 'var(--text-muted)',
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <span
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isCurrent ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.08)',
                      color: isCurrent ? '#fff' : 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                    }}
                  >
                    {idx + 1}
                  </span>
                )}
                <span>{s.title}</span>
              </div>
            );
          })}
        </div>

        {/* Bar */}
        <div
          style={{
            height: '4px',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width:
                step === 'upload'
                  ? '25%'
                  : step === 'mapping'
                  ? '50%'
                  : step === 'review'
                  ? '75%'
                  : '100%',
              backgroundColor: 'var(--accent-primary)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {/* Step Views */}
      {step === 'upload' && (
        <FileDropzone
          onUpload={uploadStatement}
          presets={presets}
          isLoading={isLoading}
        />
      )}

      {step === 'mapping' && preview && (
        <ColumnMapper
          preview={preview}
          initialMapping={mapping}
          onBack={() => setStep('upload')}
          onSubmit={submitMapping}
          isLoading={isLoading}
        />
      )}

      {step === 'review' && malformedData && (
        <MalformedPreview
          data={malformedData}
          onToggleRow={toggleMalformedRow}
          onBack={() => setStep('mapping')}
          onCommit={commitImport}
          isLoading={isLoading}
        />
      )}

      {step === 'success' && commitResult && (
        <ImportSummaryModal
          result={commitResult}
          onUploadAnother={resetWizard}
        />
      )}
    </div>
  );
};
