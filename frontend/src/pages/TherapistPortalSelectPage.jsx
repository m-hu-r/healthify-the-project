import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistPortalAPI } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';

function PinModal({ therapist, onClose, onUnlocked }) {
  const { showToast } = useToast();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4) { setError('Enter the 4-digit PIN.'); return; }
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('healthify_portal_token');
      const res = await therapistPortalAPI.unlock(token, therapist._id, pin);
      onUnlocked(res.data.unlockToken);
    } catch (err) {
      setError(err.response?.data?.error || 'Incorrect PIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 360 }} onClick={(e) => e.stopPropagation()}>
        <div className="card-body">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div
              className="therapist-avatar-sm"
              style={{ background: therapist.avatarColor, color: therapist.avatarTextColor, width: 36, height: 36 }}
            >
              {therapist.avatar}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{therapist.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Locked profile</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '10px 0 14px' }}>
            <i className="ti ti-lock" /> Enter the 4-digit PIN to unlock and edit this profile.
          </p>

          {error && (
            <div style={{
              background: 'var(--coral-light)', color: 'var(--coral)',
              borderRadius: 8, padding: '8px 12px', fontSize: 13, marginBottom: 12,
            }}>
              <i className="ti ti-alert-circle" /> {error}
            </div>
          )}

          <form onSubmit={submit}>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              className="form-input"
              placeholder="••••"
              value={pin}
              autoFocus
              style={{ textAlign: 'center', fontSize: 22, letterSpacing: 10 }}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button type="button" className="btn btn-full" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Checking…' : 'Unlock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TherapistPortalSelectPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTherapist, setActiveTherapist] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('healthify_portal_token');
    if (!token) { navigate('/therapist-portal/login'); return; }

    therapistPortalAPI.listTherapists(token)
      .then((res) => setTherapists(res.data.therapists))
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem('healthify_portal_token');
          navigate('/therapist-portal/login');
        } else {
          showToast('Could not load therapist list.', 'error');
        }
      })
      .finally(() => setLoading(false));
  }, [navigate, showToast]);

  const handleLogout = () => {
    localStorage.removeItem('healthify_portal_token');
    navigate('/therapist-portal/login');
  };

  const handleUnlocked = (unlockToken) => {
    const t = activeTherapist;
    setActiveTherapist(null);
    navigate(`/therapist-portal/edit/${t._id}`, { state: { unlockToken, name: t.name } });
  };

  if (loading) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 960 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2>Select your profile</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Each profile is PIN-locked — pick yours to unlock it.</p>
          </div>
          <button className="btn btn-sm" onClick={handleLogout}>
            <i className="ti ti-logout" /> Log out
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
          {therapists.map((t) => (
            <button
              key={t._id}
              className="card"
              style={{ textAlign: 'left', padding: '16px', cursor: 'pointer', border: '0.5px solid var(--border)', width: '100%', display: 'block' }}
              onClick={() => setActiveTherapist(t)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div
                  className="therapist-avatar-sm"
                  style={{ background: t.avatarColor, color: t.avatarTextColor, width: 40, height: 40, fontSize: 14 }}
                >
                  {t.avatar}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.title}</div>
                </div>
                <i className="ti ti-lock" style={{ color: 'var(--text-muted)' }} />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {t.specialties.slice(0, 3).map((s) => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {activeTherapist && (
        <PinModal
          therapist={activeTherapist}
          onClose={() => setActiveTherapist(null)}
          onUnlocked={handleUnlocked}
        />
      )}
    </div>
  );
}
