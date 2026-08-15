import React from 'react';
import { Calendar } from 'lucide-react';
import { MonthOption } from '@repo/shared';
import { formatMonthName } from '../../utils/formatters';

interface MonthSelectorProps {
  months: MonthOption[];
  selectedMonth: string;
  onChange: (month: string) => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  months,
  selectedMonth,
  onChange,
}) => {
  // If months array is empty, provide current month as fallback option
  const options =
    months.length > 0
      ? months
      : [{ month: selectedMonth, transactionCount: 0 }];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        padding: '0.5rem 0.875rem',
        borderRadius: 'var(--radius-md)',
      }}
    >
      <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        Period:
      </span>
      <select
        value={selectedMonth}
        onChange={(e) => onChange(e.target.value)}
        className="form-select"
        style={{
          border: 'none',
          padding: '0.25rem 0.5rem',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        {options.map((opt) => (
          <option key={opt.month} value={opt.month} style={{ backgroundColor: '#111827' }}>
            {formatMonthName(opt.month)} {opt.transactionCount > 0 ? `(${opt.transactionCount} txns)` : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
