import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  UploadCloud,
  History,
  LogOut,
  Sparkles,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      {/* Brand Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
            fontSize: '1.25rem',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)',
          }}
        >
          ₹
        </div>
        <div>
          <span
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              background: 'linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RupeeFlow
          </span>
          <span
            style={{
              display: 'block',
              fontSize: '0.6875rem',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Smart Expense Tracker
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
          }
          style={{ padding: '0.5rem 1rem' }}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </NavLink>

        <NavLink
          to="/ledger"
          className={({ isActive }) =>
            `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
          }
          style={{ padding: '0.5rem 1rem' }}
        >
          <Receipt size={16} />
          Ledger
        </NavLink>

        <NavLink
          to="/upload"
          className={({ isActive }) =>
            `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
          }
          style={{ padding: '0.5rem 1rem' }}
        >
          <UploadCloud size={16} />
          Upload Statement
        </NavLink>

        <NavLink
          to="/imports"
          className={({ isActive }) =>
            `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
          }
          style={{ padding: '0.5rem 1rem' }}
        >
          <History size={16} />
          Import Batches
        </NavLink>

        <NavLink
          to="/pricing"
          className={({ isActive }) =>
            `btn ${isActive ? 'btn-primary' : 'btn-ghost'}`
          }
          style={{
            padding: '0.5rem 1rem',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.12) 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: 'var(--accent-primary)',
          }}
        >
          <Crown size={16} />
          Upgrade
        </NavLink>
      </div>

      {/* User Status / Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.375rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>{user?.email || 'admin@example.com'}</span>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-ghost"
          style={{ padding: '0.5rem 0.75rem' }}
          title="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};
