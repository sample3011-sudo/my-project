import React from 'react';
import { CategoryBreakdownItem, CATEGORY_COLORS } from '@repo/shared';
import { formatINR } from '../../utils/formatters';
import { PieChart } from 'lucide-react';

interface CategoryChartProps {
  categories: CategoryBreakdownItem[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ categories }) => {
  if (categories.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.75rem', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <PieChart size={20} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '1.125rem' }}>Spend by Category</h3>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2.5rem 1rem',
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
          }}
        >
          No category expense data recorded for this month.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ padding: '1.75rem', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart size={20} style={{ color: 'var(--accent-primary)' }} />
          <h3 style={{ fontSize: '1.125rem' }}>Spend by Category</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {categories.length} categories
        </span>
      </div>

      {/* Multi-segment Colored Bar */}
      <div
        style={{
          height: '14px',
          width: '100%',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          display: 'flex',
          marginBottom: '1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        }}
      >
        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat.category] || '#94a3b8';
          return (
            <div
              key={cat.category}
              title={`${cat.category}: ${cat.percentage}% (${formatINR(cat.totalAmount)})`}
              style={{
                width: `${cat.percentage}%`,
                backgroundColor: color,
                transition: 'width 0.4s ease',
              }}
            />
          );
        })}
      </div>

      {/* Category List Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {categories.map((cat) => {
          const color = CATEGORY_COLORS[cat.category] || '#94a3b8';
          return (
            <div
              key={cat.category}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{cat.category}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  ({cat.transactionCount} txns)
                </span>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatINR(cat.totalAmount)}
                </span>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                  }}
                >
                  {cat.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
