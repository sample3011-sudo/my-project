import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Home, RotateCcw, Crown } from 'lucide-react';
import { usePaymentResult } from '../hooks/usePayment';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// ── Helper ────────────────────────────────────────────────────────────────────
const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);

const PLAN_LABELS: Record<string, string> = {
  pro_monthly: 'Pro Monthly',
  pro_annual: 'Pro Annual',
};

// ── Status configs ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  SUCCESS: {
    icon: CheckCircle,
    iconColor: 'var(--status-income)',
    iconBg: 'rgba(16,185,129,0.12)',
    title: 'Payment Successful! 🎉',
    subtitle: 'Your Pro plan is now active.',
    gradient: 'linear-gradient(145deg, rgba(16,185,129,0.12) 0%, rgba(99,102,241,0.08) 100%)',
    border: 'rgba(16,185,129,0.35)',
  },
  PENDING: {
    icon: Clock,
    iconColor: 'var(--status-warning)',
    iconBg: 'rgba(245,158,11,0.12)',
    title: 'Payment Processing…',
    subtitle: 'Your payment is being verified. This may take a moment.',
    gradient: 'linear-gradient(145deg, rgba(245,158,11,0.08) 0%, rgba(99,102,241,0.08) 100%)',
    border: 'rgba(245,158,11,0.3)',
  },
  FAILED: {
    icon: XCircle,
    iconColor: 'var(--status-expense)',
    iconBg: 'rgba(244,63,94,0.12)',
    title: 'Payment Failed',
    subtitle: 'Something went wrong. Your card has not been charged.',
    gradient: 'linear-gradient(145deg, rgba(244,63,94,0.08) 0%, rgba(99,102,241,0.08) 100%)',
    border: 'rgba(244,63,94,0.3)',
  },
  REFUNDED: {
    icon: RotateCcw,
    iconColor: 'var(--accent-cyan)',
    iconBg: 'rgba(6,182,212,0.12)',
    title: 'Payment Refunded',
    subtitle: 'Your refund has been initiated.',
    gradient: 'linear-gradient(145deg, rgba(6,182,212,0.08) 0%, rgba(99,102,241,0.08) 100%)',
    border: 'rgba(6,182,212,0.3)',
  },
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

export const PaymentResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const { status, isLoading, error } = usePaymentResult(orderId);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Verifying your payment…" size="lg" />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !status) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div
          className="glass-panel"
          style={{ padding: '2.5rem', maxWidth: '460px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(244,63,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={30} style={{ color: 'var(--status-expense)' }} />
          </div>
          <h2 style={{ fontSize: '1.375rem' }}>Unable to Verify Payment</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>{error ?? 'No order information found.'}</p>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/pricing')} style={{ display: 'flex', gap: '0.5rem' }}>
              <RotateCcw size={15} />Try Again
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              <Home size={15} />Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  const cfg = STATUS_CONFIG[status.status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;

  return (
    <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          borderRadius: 'var(--radius-xl)',
          background: cfg.gradient,
          border: `1px solid ${cfg.border}`,
          boxShadow: 'var(--shadow-lg)',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          alignItems: 'center',
          textAlign: 'center',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: cfg.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={34} style={{ color: cfg.iconColor }} />
        </div>

        {/* Title */}
        <div>
          <h1 style={{ fontSize: '1.625rem', marginBottom: '0.5rem' }}>{cfg.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: 1.6 }}>{cfg.subtitle}</p>
        </div>

        {/* Order details */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          <DetailRow label="Order ID" value={status.orderId} mono />
          <DetailRow label="Plan" value={<span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Crown size={13} style={{ color: 'var(--accent-primary)' }} />{PLAN_LABELS[status.plan] ?? status.plan}</span>} />
          <DetailRow label="Amount" value={formatINR(status.amount)} />
          <DetailRow label="Currency" value={status.currency} />
          <DetailRow
            label="Status"
            value={
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.2rem 0.625rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: cfg.iconBg,
                  color: cfg.iconColor,
                }}
              >
                {status.status}
              </span>
            }
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          {status.status === 'FAILED' && (
            <button className="btn btn-secondary" onClick={() => navigate('/pricing')} style={{ flex: 1, minWidth: '140px' }}>
              <RotateCcw size={15} /> Try Again
            </button>
          )}
          <button
            id="go-to-dashboard"
            className="btn btn-primary"
            onClick={() => navigate('/')}
            style={{ flex: 1, minWidth: '140px' }}
          >
            <Home size={15} /> Go to Dashboard
          </button>
        </div>

        {status.status === 'SUCCESS' && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            A confirmation has been sent to your registered email address.
          </p>
        )}
      </div>
    </div>
  );
};

// ── Detail Row ────────────────────────────────────────────────────────────────
const DetailRow: React.FC<{ label: string; value: React.ReactNode; mono?: boolean }> = ({
  label,
  value,
  mono,
}) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>{label}</span>
    <span
      style={{
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        fontFamily: mono ? 'monospace' : undefined,
        wordBreak: 'break-all',
        textAlign: 'right',
      }}
    >
      {value}
    </span>
  </div>
);
