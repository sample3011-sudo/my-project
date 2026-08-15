import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../hooks/useDashboard';
import { MonthSelector } from '../components/dashboard/MonthSelector';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { CategoryChart } from '../components/dashboard/CategoryChart';
import { TopMerchants } from '../components/dashboard/TopMerchants';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { EmptyState } from '../components/common/EmptyState';
import { UploadCloud, Sparkles } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const {
    months,
    selectedMonth,
    setSelectedMonth,
    summary,
    categories,
    merchants,
    isLoading,
    error,
    isEmpty,
    refetch,
  } = useDashboard();

  const navigate = useNavigate();

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
          marginBottom: '2rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Sparkles size={20} style={{ color: 'var(--accent-primary)' }} />
            <h1 style={{ fontSize: '1.75rem' }}>Financial Overview</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Monthly income, spend distribution, and top merchant analytics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MonthSelector
            months={months}
            selectedMonth={selectedMonth}
            onChange={setSelectedMonth}
          />
          <button
            onClick={() => navigate('/upload')}
            className="btn btn-primary"
            style={{ padding: '0.625rem 1rem' }}
          >
            <UploadCloud size={16} />
            Upload Statement
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Loading state */}
      {isLoading ? (
        <LoadingSpinner message="Calculating monthly finances..." size="lg" />
      ) : isEmpty ? (
        /* Empty state */
        <EmptyState
          title="No Transactions Found"
          description={`You have no recorded financial activity for this month. Upload your bank statement to view your cashflow and smart category breakdown.`}
          action={{
            label: 'Upload Bank Statement',
            onClick: () => navigate('/upload'),
          }}
        />
      ) : (
        /* Success state */
        <>
          <SummaryCards summary={summary} />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <CategoryChart categories={categories} />
            <TopMerchants merchants={merchants} />
          </div>
        </>
      )}
    </div>
  );
};
