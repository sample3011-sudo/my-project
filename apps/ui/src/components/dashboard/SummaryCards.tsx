import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Sparkles } from 'lucide-react';
import { MonthSummary } from '@repo/shared';
import { formatINR, formatMonthName } from '../../utils/formatters';

interface SummaryCardsProps {
  summary: MonthSummary | null;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const totalIn = summary?.totalIn || 0;
  const totalOut = summary?.totalOut || 0;
  const netSavings = summary?.netSavings || 0;
  const savingsRate = totalIn > 0 ? ((netSavings / totalIn) * 100).toFixed(0) : '0';

  let narrative = '';
  if (!summary || summary.transactionCount === 0) {
    narrative = `No transactions recorded for ${formatMonthName(summary?.month || '')}. Upload a statement to get started!`;
  } else if (netSavings > 0) {
    narrative = `🎉 Great job! You saved ${formatINR(netSavings)} this month (${savingsRate}% of total income).`;
  } else if (netSavings < 0) {
    narrative = `⚠️ You spent ${formatINR(Math.abs(netSavings))} more than your income this month.`;
  } else {
    narrative = `Your income and expenses balanced out exactly this month (${formatINR(totalIn)}).`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2rem' }}>
      {/* 3 Metrics Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Income Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-full)',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              TOTAL INFLOW (INCOME)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-income-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-income)',
              }}
            >
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-income)' }}>
            {formatINR(totalIn)}
          </div>
        </div>

        {/* Total Outflow Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-full)',
              background: 'radial-gradient(circle, rgba(244, 63, 94, 0.2) 0%, transparent 70%)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              TOTAL OUTFLOW (EXPENSE)
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--status-expense-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--status-expense)',
              }}
            >
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-expense)' }}>
            {formatINR(totalOut)}
          </div>
        </div>

        {/* Net Savings Card */}
        <div
          className="glass-panel"
          style={{
            padding: '1.5rem',
            position: 'relative',
            overflow: 'hidden',
            borderLeft: `4px solid ${netSavings >= 0 ? 'var(--status-income)' : 'var(--status-expense)'}`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: 'var(--radius-full)',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%)',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              NET SAVINGS
            </span>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
              }}
            >
              <PiggyBank size={18} />
            </div>
          </div>
          <div
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: netSavings >= 0 ? 'var(--text-primary)' : 'var(--status-expense)',
            }}
          >
            {formatINR(netSavings, { showSign: true })}
          </div>
        </div>
      </div>

      {/* Narrative Summary Alert */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          fontWeight: 500,
        }}
      >
        <Sparkles size={18} style={{ color: 'var(--accent-primary)', flexShrink: 0 }} />
        <span>{narrative}</span>
      </div>
    </div>
  );
};
