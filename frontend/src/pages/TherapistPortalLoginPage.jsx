import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { therapistPortalAPI } from '../utils/api.js';

export default function TherapistPortalLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in both fields.'); return; }
    setLoading(true);
    try {
      const res = await therapistPortalAPI.login(form.email, form.password);
      localStorage.setItem('healthify_portal_token', res.data.token);
      navigate('/therapist-portal/select');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--teal)', fontSize: 20, fontWeight: 500 }}>
            <i className="ti ti-heart-handshake" /> healthify
          </Link>
        </div>
        <h2 className="auth-title">Therapist Portal</h2>
        <p className="auth-sub">Sign in to manage your practice profile</p>

        {error && (
          <div style={{
            background: 'var(--coral-light)', border: '0.5px solid var(--coral)',
            borderRadius: 8, padding: '10px 14px', fontSize: 14,
            color: 'var(--coral)', marginBottom: '1.25rem',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <i className="ti ti-alert-circle" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Portal email</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@healthify.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPw ? 'text' : 'password'}
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: 'var(--text-muted)', cursor: 'pointer',
                }}
              >
                <i className={`ti ${showPw ? 'ti-eye-off' : 'ti-eye'}`} />
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Signing in…</> : 'Sign in to portal'}
          </button>
        </form>

        <div className="auth-footer">
          Not a therapist? <Link to="/login" className="auth-link">Go to the regular login</Link>
        </div>
      </div>
    </div>
  );
}
