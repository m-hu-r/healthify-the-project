import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully');
    navigate('/');
    setMenuOpen(false);
  };

  const initials = user
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '';

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-logo">
          <i className="ti ti-heart-handshake" />
          healthify
        </Link>

        <div className="nav-links">
          <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <i className="ti ti-home" /> Home
          </NavLink>
          <NavLink to="/therapists" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <i className="ti ti-users" /> Therapists
          </NavLink>
          {user && (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <i className="ti ti-layout-dashboard" /> Dashboard
              </NavLink>
              <NavLink to="/ai-support" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <i className="ti ti-message-circle" /> AI Support
              </NavLink>
              <NavLink to="/ai-analyser" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <i className="ti ti-compass" /> AI Analyser
              </NavLink>
            </>
          )}
        </div>

        <div className="nav-right">
          <Link to="/therapist-portal/login" className="btn btn-sm hide-mobile" title="Therapist portal">
            <i className="ti ti-stethoscope" /> Therapist portal
          </Link>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            <i className={theme === 'dark' ? 'ti ti-sun' : 'ti ti-moon'} />
          </button>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="nav-avatar"
                onClick={() => setMenuOpen((o) => !o)}
                title={user.name}
              >
                {initials}
              </button>
              {menuOpen && (
                <div className="dropdown-menu" onClick={() => setMenuOpen(false)}>
                  <div className="dropdown-header">
                    <div style={{ fontWeight: 500, fontSize: 14 }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{user.email}</div>
                  </div>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item" onClick={() => navigate('/dashboard')}>
                    <i className="ti ti-layout-dashboard" /> Dashboard
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/ai-support')}>
                    <i className="ti ti-message-circle" /> AI Support
                  </button>
                  <button className="dropdown-item" onClick={() => navigate('/ai-analyser')}>
                    <i className="ti ti-compass" /> AI Analyser
                  </button>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item text-coral" onClick={handleLogout}>
                    <i className="ti ti-logout" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-sm hide-mobile">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          )}
        </div>
      </div>

      <style>{`
        .theme-toggle-btn {
          display: flex; align-items: center; justify-content: center;
          width: 36px; height: 36px; border-radius: 50%;
          background: var(--surface-1); border: 0.5px solid var(--border);
          color: var(--text-primary); font-size: 16px;
          transition: background 0.15s, transform 0.15s;
        }
        .theme-toggle-btn:hover { background: var(--surface-2); transform: rotate(15deg); }
        .dropdown-menu {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: var(--surface-2);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          min-width: 200px; z-index: 300;
          overflow: hidden;
        }
        .dropdown-header { padding: 12px 14px; }
        .dropdown-divider { height: 0.5px; background: var(--border); }
        .dropdown-item {
          width: 100%; padding: 9px 14px;
          display: flex; align-items: center; gap: 8px;
          font-size: 14px; background: none; border: none;
          cursor: pointer; color: var(--text-primary);
          transition: background 0.1s; text-align: left;
        }
        .dropdown-item:hover { background: var(--surface-1); }
        .dropdown-item.text-coral { color: var(--coral); }
        .dropdown-item i { font-size: 16px; }
      `}</style>
    </nav>
  );
}
 