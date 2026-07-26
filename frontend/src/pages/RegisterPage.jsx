import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Please enter your name.';
    if (!form.email) return 'Please enter your email.';
    if (form.password.length < 8) return 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      showToast('Welcome to healthify! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strengthScore = () => {
    const p = form.password;
    if (!p) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };
  const strength = strengthScore();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength] || '';
  const strengthColor = ['', 'var(--coral)', 'var(--amber)', 'var(--amber)', 'var(--teal)', 'var(--teal)'][strength] || '';

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--teal)', fontSize: 20, fontWeight: 500 }}>
            <i className="ti ti-heart-handshake" /> healthify
          </Link>
        </div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-sub">Start your mental wellness journey today</p>

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
            <label className="form-label" htmlFor="name">Full name</label>
            <input
              id="name"
              name="name"
              type="text"
              className="form-input"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
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
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            {form.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4,5].map((n) => (
                    <div key={n} style={{
                      height: 3, flex: 1, borderRadius: 2,
                      background: n <= strength ? strengthColor : 'var(--border)',
                      transition: 'background 0.2s',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 11, color: strengthColor }}>{strengthLabel}</div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPw ? 'text' : 'password'}
              className="form-input"
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              style={{
                borderColor: form.confirmPassword && form.confirmPassword !== form.password ? 'var(--coral)' : undefined,
              }}
            />
            {form.confirmPassword && form.confirmPassword !== form.password && (
              <div className="form-error">Passwords don't match</div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Creating account…</> : 'Create account'}
          </button>
        </form>

        <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, lineHeight: 1.5 }}>
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
 