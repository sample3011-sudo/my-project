import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Category, CategoryEnum, LedgerFilters } from '@repo/shared';

interface LedgerFiltersProps {
  filters: LedgerFilters;
  onFilterChange: (filters: Partial<LedgerFilters>) => void;
}

export const LedgerFiltersComponent: React.FC<LedgerFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const categories = CategoryEnum.options;

  const handleCategoryToggle = (cat: Category) => {
    const current = filters.categories || [];
    const updated = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    onFilterChange({ categories: updated.length > 0 ? updated : undefined });
  };

  const clearAllFilters = () => {
    onFilterChange({
      search: undefined,
      categories: undefined,
      txnType: 'both',
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.categories && filters.categories.length > 0) ||
    filters.txnType !== 'both' ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            type="text"
            className="form-input"
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
            placeholder="Search description, merchant, or note..."
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Transaction Type Segmented Toggle */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'var(--bg-input)',
            padding: '3px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {(['both', 'expense', 'income'] as const).map((type) => {
            const isSelected = (filters.txnType || 'both') === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onFilterChange({ txnType: type })}
                style={{
                  padding: '0.4rem 0.875rem',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isSelected ? 'var(--accent-primary)' : 'transparent',
                  color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                }}
              >
                {type === 'both' ? 'All Types' : type}
              </button>
            );
          })}
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="btn btn-ghost"
            style={{ fontSize: '0.8125rem', color: '#fb7185' }}
          >
            <X size={14} />
            Reset Filters
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
          <Filter size={12} />
          CATEGORIES:
        </div>
        {categories.map((cat) => {
          const isSelected = filters.categories?.includes(cat);
          return (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryToggle(cat)}
              style={{
                padding: '0.25rem 0.625rem',
                fontSize: '0.75rem',
                fontWeight: 600,
                borderRadius: 'var(--radius-full)',
                border: isSelected
                  ? '1px solid var(--accent-primary)'
                  : '1px solid var(--border-subtle)',
                backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
};
