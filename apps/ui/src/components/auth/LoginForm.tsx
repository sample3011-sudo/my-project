import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Mail, ArrowRight, Loader2, Sparkles } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      await login(email, password);
    } catch (err: any) {
      setLocalError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        width: '100%',
        maxWidth: '440px',
        padding: '2.5rem',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), var(--shadow-glow)',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '1.75rem',
            fontWeight: 800,
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)',
          }}
        >
          ₹
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Sign in to manage and analyze your personal cashflow
        </p>
      </div>

      {(error || localError) && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--status-expense-bg)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fb7185',
            fontSize: '0.8125rem',
            marginBottom: '1.25rem',
          }}
        >
          {error || localError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email-input">
            Email Address
          </label>
          <div style={{ position: 'relative' }}>
            <Mail
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
              id="email-input"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: '1.75rem' }}>
          <label className="form-label" htmlFor="password-input">
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <Lock
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
              id="password-input"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{ width: '100%', paddingLeft: '2.5rem' }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem' }}
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              Sign In to RupeeFlow
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      <div
        style={{
          marginTop: '1.5rem',
          padding: '0.75rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px dashed var(--border-subtle)',
          textAlign: 'center',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px', color: 'var(--text-secondary)' }}>
          <Sparkles size={12} style={{ color: 'var(--accent-primary)' }} />
          <span>Default Demo Credentials</span>
        </div>
        <code>admin@example.com</code> / <code>Admin@123</code>
      </div>
    </div>
  );
};
