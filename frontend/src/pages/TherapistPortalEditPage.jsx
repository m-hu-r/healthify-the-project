import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { therapistPortalAPI } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';

function ChipInput({ label, values, onChange, placeholder }) {
  const [draft, setDraft] = useState('');

  const addChip = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft('');
  };

  const removeChip = (v) => onChange(values.filter((x) => x !== v));

  return (
    <div className="form-group">
      <label className="form-label">{label}</label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {values.map((v) => (
          <span key={v} className="tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {v}
            <i
              className="ti ti-x"
              style={{ cursor: 'pointer', fontSize: 12 }}
              onClick={() => removeChip(v)}
            />
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          className="form-input"
          placeholder={placeholder}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addChip(); } }}
        />
        <button type="button" className="btn btn-sm" onClick={addChip}>Add</button>
      </div>
    </div>
  );
}

const RESPONSE_TIME_OPTIONS = ['< 1 hour', '< 2 hours', '< 4 hours', '< 24 hours', '1-2 business days'];

export default function TherapistPortalEditPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [unlockToken] = useState(location.state?.unlockToken || null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [therapist, setTherapist] = useState(null);
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!unlockToken) {
      showToast('This profile is locked. Please unlock it first.', 'error');
      navigate('/therapist-portal/select');
      return;
    }
    therapistPortalAPI.getTherapist(unlockToken, id)
      .then((res) => {
        const t = res.data.therapist;
        setTherapist(t);
        setForm({
          averageResponseTime: t.averageResponseTime || '< 24 hours',
          languages: t.languages || [],
          specialties: t.specialties || [],
          sessionCompletionRate: t.sessionCompletionRate ?? 95,
          yearsExperience: t.yearsExperience ?? 0,
          verifiedCredentials: !!t.verifiedCredentials,
          bio: t.bio || '',
          pricePerSession: t.pricePerSession ?? 0,
        });
      })
      .catch((err) => {
        showToast(err.response?.data?.error || 'Could not load this profile.', 'error');
        navigate('/therapist-portal/select');
      })
      .finally(() => setLoading(false));
  }, [id, unlockToken, navigate, showToast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await therapistPortalAPI.updateTherapist(unlockToken, id, form);
      setTherapist(res.data.therapist);
      showToast('Profile updated.');
    } catch (err) {
      showToast(err.response?.data?.error || 'Could not save changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <div className="page-loading"><div className="spinner" /></div>;
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <Link to="/therapist-portal/select" style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
          <i className="ti ti-arrow-left" /> Back to profile list
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
          <div
            className="therapist-avatar-sm"
            style={{ background: therapist.avatarColor, color: therapist.avatarTextColor, width: 46, height: 46, fontSize: 16 }}
          >
            {therapist.avatar}
          </div>
          <div>
            <h2 style={{ marginBottom: 2 }}>{therapist.name}</h2>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{therapist.title}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="card">
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Average response time</label>
              <select
                className="form-input"
                value={form.averageResponseTime}
                onChange={(e) => setForm((f) => ({ ...f, averageResponseTime: e.target.value }))}
              >
                {RESPONSE_TIME_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>

            <ChipInput
              label="Languages spoken"
              values={form.languages}
              placeholder="e.g. English"
              onChange={(languages) => setForm((f) => ({ ...f, languages }))}
            />

            <ChipInput
              label="Areas of expertise"
              values={form.specialties}
              placeholder="e.g. Anxiety"
              onChange={(specialties) => setForm((f) => ({ ...f, specialties }))}
            />

            <div className="form-group">
              <label className="form-label">Session completion rate (%)</label>
              <input
                type="number" min="0" max="100" className="form-input"
                value={form.sessionCompletionRate}
                onChange={(e) => setForm((f) => ({ ...f, sessionCompletionRate: Number(e.target.value) }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Years of experience</label>
              <input
                type="number" min="0" className="form-input"
                value={form.yearsExperience}
                onChange={(e) => setForm((f) => ({ ...f, yearsExperience: Number(e.target.value) }))}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="checkbox" id="verified"
                checked={form.verifiedCredentials}
                onChange={(e) => setForm((f) => ({ ...f, verifiedCredentials: e.target.checked }))}
              />
              <label htmlFor="verified" className="form-label" style={{ marginBottom: 0 }}>
                Credentials verified <i className="ti ti-shield-check" style={{ color: 'var(--teal)' }} />
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Price per session ($)</label>
              <input
                type="number" min="0" className="form-input"
                value={form.pricePerSession}
                onChange={(e) => setForm((f) => ({ ...f, pricePerSession: Number(e.target.value) }))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bio</label>
              <textarea
                className="form-input" rows={4}
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
