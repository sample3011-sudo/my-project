import React from 'react';
import { Check, Zap, Crown, ArrowRight, Sparkles, Shield, BarChart3, Infinity } from 'lucide-react';
import { PLANS } from '@repo/shared';
import { usePayment } from '../hooks/usePayment';

// ── Free tier features ────────────────────────────────────────────────────────
const FREE_FEATURES = [
  'Upload up to 3 bank statements',
  'Basic AI categorization',
  'Dashboard overview',
  'Transaction ledger',
];

// ── Pro features ──────────────────────────────────────────────────────────────
const PRO_FEATURES = [
  'Unlimited statement uploads',
  'Advanced AI categorization (LLM)',
  'Merchant rule learning & overrides',
  'Month-over-month trend analytics',
  'Recurring charge detection',
  'Export reports (CSV/PDF)',
  'Priority support',
];

// ── Icons for feature highlights ─────────────────────────────────────────────
const HIGHLIGHT_ITEMS = [
  { icon: Infinity, label: 'Unlimited Imports', desc: 'Upload as many statements as you need' },
  { icon: Zap, label: 'AI Categorization', desc: 'LLM-powered, rule-cached for speed' },
  { icon: BarChart3, label: 'Deep Analytics', desc: 'Trends, recurring charges, top merchants' },
  { icon: Shield, label: 'Privacy First', desc: 'Your data stays on your server' },
];

// ── Helper ────────────────────────────────────────────────────────────────────
const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

// ── Component ─────────────────────────────────────────────────────────────────

export const PricingPage: React.FC = () => {
  const { paymentState, error, initiatePayment } = usePayment();
  const [selectedPlan, setSelectedPlan] = React.useState<'pro_monthly' | 'pro_annual'>('pro_monthly');

  const isLoading = paymentState === 'creating' || paymentState === 'redirecting';

  const handleUpgrade = async (): Promise<void> => {
    await initiatePayment(selectedPlan);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '3rem 1.5rem' }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 'var(--radius-full)',
            padding: '0.375rem 1rem',
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--accent-primary)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: '1.25rem',
          }}
        >
          <Crown size={14} />
          Upgrade to Pro
        </div>

        <h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '1rem',
            lineHeight: 1.15,
          }}
        >
          Take full control of<br />your finances
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: '1.0625rem', maxWidth: '480px', margin: '0 auto' }}>
          Unlock unlimited imports, advanced AI categorization, and deep spending insights.
        </p>
      </div>

      {/* ── Feature highlights ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '3rem',
        }}
      >
        {HIGHLIGHT_ITEMS.map(({ icon: Icon, label, desc }) => (
          <div
            key={label}
            className="glass-panel"
            style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                marginBottom: '0.25rem',
              }}
            >
              <Icon size={18} />
            </div>
            <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{label}</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</span>
          </div>
        ))}
      </div>

      {/* ── Pricing cards ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

        {/* Free Card */}
        <div
          className="glass-panel"
          style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Free</p>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹0</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>/month</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Get started with the basics
            </p>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {FREE_FEATURES.map((feat) => (
              <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <Check size={15} style={{ color: 'var(--text-muted)', marginTop: '2px', flexShrink: 0 }} />
                {feat}
              </li>
            ))}
          </ul>

          <button className="btn btn-secondary" disabled style={{ width: '100%' }}>
            Current Plan
          </button>
        </div>

        {/* Pro Card */}
        <div
          style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(145deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.12) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            boxShadow: '0 0 40px rgba(99, 102, 241, 0.15), var(--shadow-lg)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Popular badge */}
          <div
            style={{
              position: 'absolute',
              top: '1.25rem',
              right: '1.25rem',
              background: 'linear-gradient(135deg, var(--accent-primary) 0%, #7c3aed 100%)',
              color: '#fff',
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 4px 12px rgba(99,102,241,0.5)',
            }}
          >
            ✦ Most Popular
          </div>

          {/* Glow orb */}
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Crown size={16} style={{ color: 'var(--accent-primary)' }} />
              <p style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pro</p>
            </div>

            {/* Plan toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {(['pro_monthly', 'pro_annual'] as const).map((pid) => {
                const p = PLANS[pid];
                const isSelected = selectedPlan === pid;
                return (
                  <button
                    key={pid}
                    id={`plan-toggle-${pid}`}
                    onClick={() => setSelectedPlan(pid)}
                    style={{
                      flex: 1,
                      padding: '0.375rem 0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${isSelected ? 'rgba(99,102,241,0.7)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                      color: isSelected ? '#fff' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {pid === 'pro_monthly' ? 'Monthly' : 'Annual'}
                    {pid === 'pro_annual' && (
                      <span style={{ marginLeft: '4px', color: 'var(--status-income)', fontSize: '0.6875rem' }}>−17%</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {formatINR(PLANS[selectedPlan].amount)}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                /{selectedPlan === 'pro_monthly' ? 'month' : 'year'}
              </span>
            </div>
            {selectedPlan === 'pro_annual' && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--status-income)', marginTop: '0.25rem', fontWeight: 600 }}>
                ≈ ₹165/month — 2 months free
              </p>
            )}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Everything you need, nothing you don't
            </p>
          </div>

          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
            {PRO_FEATURES.map((feat) => (
              <li key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(99,102,241,0.2)',
                  border: '1px solid rgba(99,102,241,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}>
                  <Check size={11} style={{ color: 'var(--accent-primary)' }} />
                </div>
                {feat}
              </li>
            ))}
          </ul>

          {/* Error */}
          {paymentState === 'error' && error && (
            <div style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(244,63,94,0.1)',
              border: '1px solid rgba(244,63,94,0.3)',
              fontSize: '0.8125rem',
              color: '#fb7185',
            }}>
              {error}
            </div>
          )}

          <button
            id="upgrade-cta"
            className="btn btn-primary"
            onClick={handleUpgrade}
            disabled={isLoading}
            style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
          >
            {isLoading ? (
              <>
                <span
                  className="animate-spin"
                  style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block' }}
                />
                {paymentState === 'creating' ? 'Creating order...' : 'Redirecting to checkout...'}
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Upgrade to Pro
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Secured by Cashfree · 256-bit SSL encryption
          </p>
        </div>
      </div>

      {/* ── Trust signals ─────────────────────────────────────────────────── */}
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem', display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap' }}>
        <span>✓ Cancel anytime</span>
        <span>✓ INR billing — no conversion fees</span>
        <span>✓ Instant access after payment</span>
      </div>
    </div>
  );
};
