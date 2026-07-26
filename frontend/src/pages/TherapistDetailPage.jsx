import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { therapistsAPI } from '../utils/api.js';
import BookingModal from '../components/BookingModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function TherapistDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [therapist, setTherapist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    therapistsAPI.get(id)
      .then((res) => setTherapist(res.data.therapist))
      .catch(() => navigate('/therapists'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!therapist) return null;

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    setShowBooking(true);
  };

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <button className="btn btn-ghost btn-sm mb-md" onClick={() => navigate(-1)}>
          <i className="ti ti-arrow-left" /> Back
        </button>

        {}
        <div className="card mb-md">
          <div className="card-body" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div
              className="avatar avatar-lg"
              style={{ background: therapist.avatarColor, color: therapist.avatarTextColor, fontSize: 22 }}
            >
              {therapist.avatar}
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              <h2 style={{ marginBottom: 4 }}>{therapist.name}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 10 }}>{therapist.title}</p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 14, color: 'var(--amber)' }}>
                  <i className="ti ti-star-filled" />
                  <strong>{therapist.rating}</strong>
                  <span style={{ color: 'var(--text-secondary)' }}>({therapist.reviewCount} reviews)</span>
                </div>
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                  <i className="ti ti-clock" /> {therapist.yearsExperience} years experience
                </div>
                {therapist.languages?.length > 0 && (
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                    <i className="ti ti-language" /> {therapist.languages.join(', ')}
                  </div>
                )}
              </div>
              <div className="tc-tags">
                {therapist.specialties?.map((s) => <span key={s} className="tag">{s}</span>)}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 28, fontWeight: 500, color: 'var(--teal)' }}>${therapist.pricePerSession}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12 }}>per session</div>
              <button className="btn btn-primary btn-lg" onClick={handleBook}>
                <i className="ti ti-calendar-plus" /> Book session
              </button>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {}
          <div>
            <div className="card mb-md">
              <div className="card-header"><span className="card-title"><i className="ti ti-user" /> About</span></div>
              <div className="card-body">
                <p style={{ fontSize: 14, lineHeight: 1.75 }}>{therapist.bio}</p>
              </div>
            </div>

            <div className="card mb-md">
              <div className="card-header"><span className="card-title"><i className="ti ti-brain" /> Therapeutic approaches</span></div>
              <div className="card-body">
                <div className="tc-tags" style={{ marginBottom: 0 }}>
                  {therapist.approaches?.map((a) => (
                    <span key={a} className="tag" style={{ padding: '5px 12px' }}>{a}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title"><i className="ti ti-certificate" /> Credentials</span></div>
              <div className="card-body" style={{ fontSize: 14 }}>
                {therapist.education && (
                  <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                    <i className="ti ti-school" style={{ color: 'var(--teal)', flexShrink: 0 }} />
                    <span>{therapist.education}</span>
                  </div>
                )}
                {therapist.licenseNumber && (
                  <div style={{ display: 'flex', gap: 10 }}>
                    <i className="ti ti-id" style={{ color: 'var(--teal)', flexShrink: 0 }} />
                    <span>License: {therapist.licenseNumber}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {}
          <div>
            <div className="card mb-md">
              <div className="card-header"><span className="card-title"><i className="ti ti-devices" /> Session formats</span></div>
              <div className="card-body">
                {[
                  { key: 'video', label: 'Video call', icon: 'ti-video', price: therapist.pricePerSession },
                  { key: 'phone', label: 'Phone call', icon: 'ti-phone', price: therapist.pricePerSession },
                  { key: 'chat', label: 'Text chat', icon: 'ti-message', price: Math.round(therapist.pricePerSession * 0.8) },
                  { key: 'inperson', label: 'In-person', icon: 'ti-building', price: Math.round(therapist.pricePerSession * 1.1) },
                ].filter((t) => therapist.sessionTypes?.includes(t.key)).map((t) => (
                  <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: 14, borderBottom: '0.5px solid var(--border)' }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <i className={`ti ${t.icon}`} style={{ color: 'var(--teal)' }} />
                      {t.label}
                    </div>
                    <span style={{ fontWeight: 500 }}>${t.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-header"><span className="card-title"><i className="ti ti-calendar" /> Weekly availability</span></div>
              <div className="card-body">
                {days.map((day) => {
                  const slots = therapist.availability?.[day] || [];
                  if (slots.length === 0) return null;
                  return (
                    <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13, borderBottom: '0.5px solid var(--border)' }}>
                      <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{day}</span>
                      <span style={{ color: 'var(--teal)' }}>{slots.length} slot{slots.length !== 1 ? 's' : ''}</span>
                    </div>
                  );
                })}
              </div>
              <div className="card-footer">
                <button className="btn btn-primary btn-full" onClick={handleBook}>
                  <i className="ti ti-calendar-plus" /> Book a session
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBooking && (
        <BookingModal therapist={therapist} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
}
