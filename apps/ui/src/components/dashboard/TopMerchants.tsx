import React from 'react';
import { TopMerchant } from '@repo/shared';
import { formatINR } from '../../utils/formatters';
import { Store, Award } from 'lucide-react';

interface TopMerchantsProps {
  merchants: TopMerchant[];
}

export const TopMerchants: React.FC<TopMerchantsProps> = ({ merchants }) => {
  if (merchants.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '1.75rem', height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Store size={20} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '1.125rem' }}>Top Merchants</h3>
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
          No merchant spending records found for this month.
        </div>
      </div>
    );
  }

  const maxSpend = Math.max(...merchants.map((m) => m.totalAmount), 1);

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
          <Store size={20} style={{ color: 'var(--accent-cyan)' }} />
          <h3 style={{ fontSize: '1.125rem' }}>Top Merchants</h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Ranked by net spend
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {merchants.map((m, index) => {
          const rank = index + 1;
          const percentageOfTop = (m.totalAmount / maxSpend) * 100;
          const isTopRank = rank === 1;

          return (
            <div
              key={m.merchant}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isTopRank ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                border: isTopRank ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <span
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isTopRank ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                      color: isTopRank ? '#fff' : 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                    }}
                  >
                    {isTopRank ? <Award size={14} /> : `#${rank}`}
                  </span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {m.merchant}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    ({m.transactionCount} {m.transactionCount === 1 ? 'order' : 'orders'})
                  </span>
                </div>

                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {formatINR(m.totalAmount)}
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  height: '6px',
                  width: '100%',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${percentageOfTop}%`,
                    background: isTopRank
                      ? 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)'
                      : 'var(--accent-cyan)',
                    borderRadius: 'var(--radius-full)',
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
