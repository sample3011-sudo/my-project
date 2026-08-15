import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLedger } from '../hooks/useLedger';
import { LedgerFiltersComponent } from '../components/ledger/LedgerFilters';
import { LedgerTable } from '../components/ledger/LedgerTable';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { EmptyState } from '../components/common/EmptyState';
import { Receipt, UploadCloud } from 'lucide-react';

export const LedgerPage: React.FC = () => {
  const {
    items,
    meta,
    summary,
    filters,
    isLoading,
    error,
    isEmpty,
    updateFilters,
    updateTransactionCategory,
    updateTransactionNote,
    refetch,
  } = useLedger();

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
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Receipt size={20} style={{ color: 'var(--accent-primary)' }} />
            <h1 style={{ fontSize: '1.75rem' }}>Transaction Ledger</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Search, filter, and manage transaction categories with instant sticky rule sync
          </p>
        </div>

        <button
          onClick={() => navigate('/upload')}
          className="btn btn-primary"
          style={{ padding: '0.625rem 1rem' }}
        >
          <UploadCloud size={16} />
          Upload Statement
        </button>
      </div>

      {/* Filter Component */}
      <LedgerFiltersComponent
        filters={filters}
        onFilterChange={updateFilters}
      />

      {/* Error State */}
      {error && <ErrorBanner message={error} onRetry={refetch} />}

      {/* Loading State */}
      {isLoading ? (
        <LoadingSpinner message="Fetching transactions..." size="lg" />
      ) : isEmpty ? (
        /* Empty State */
        <EmptyState
          title="No Transactions Found"
          description="No transactions match your current search and filter criteria."
          action={{
            label: 'Clear Filters',
            onClick: () =>
              updateFilters({
                search: undefined,
                categories: undefined,
                txnType: 'both',
              }),
          }}
        />
      ) : (
        /* Success State */
        <LedgerTable
          items={items}
          meta={meta}
          summary={summary}
          onPageChange={(page) => updateFilters({ page })}
          onUpdateCategory={updateTransactionCategory}
          onUpdateNote={updateTransactionNote}
        />
      )}
    </div>
  );
};
