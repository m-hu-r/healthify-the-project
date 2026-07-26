import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistsAPI, sessionsAPI } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { format, addDays } from 'date-fns';

const SESSION_TYPES = [
  { key: 'video',    label: 'Video call',   icon: 'ti-video',     color: 'var(--teal)',   priceMultiplier: 1.0 },
  { key: 'phone',    label: 'Phone call',   icon: 'ti-phone',     color: 'var(--purple)', priceMultiplier: 1.0 },
  { key: 'chat',     label: 'Text chat',    icon: 'ti-message',   color: 'var(--teal-mid)', priceMultiplier: 0.8 },
  { key: 'inperson', label: 'In-person',    icon: 'ti-building',  color: 'var(--coral)',  priceMultiplier: 1.1 },
];

const DURATIONS = [
  { value: 25,  label: '25 min — Brief check-in' },
  { value: 50,  label: '50 min — Standard session' },
  { value: 80,  label: '80 min — Extended session' },
];

function StepBar({ current, total }) {
  return (
    <div className="step-bar">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`step-dot${i < current ? ' done' : ''}`} />
      ))}
    </div>
  );
}

function TherapistMini({ therapist }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px', background: 'var(--surface-1)',
      borderRadius: 10, marginBottom: '1.5rem',
    }}>
      <div
        className="avatar avatar-md"
        style={{ background: therapist.avatarColor, color: therapist.avatarTextColor }}
      >
        {therapist.avatar}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{therapist.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{therapist.title}</div>
      </div>
    </div>
  );
}

export default function BookingModal({ therapist, onClose }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [sessionType, setSessionType] = useState('video');
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [duration, setDuration] = useState(50);
  const [focusAreas, setFocusAreas] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookedSession, setBookedSession] = useState(null);

  const dates = Array.from({ length: 10 }, (_, i) => addDays(new Date(), i + 1))
    .filter((d) => d.getDay() !== 0 && d.getDay() !== 6)
    .slice(0, 7);

  useEffect(() => {
    if (!selectedDate) return;
    setSlotsLoading(true);
    setSelectedTime('');
    therapistsAPI
      .getSlots(therapist._id, selectedDate)
      .then((res) => setSlots(res.data.slots || []))
      .catch(() => {
        const dayNames = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
        const dow = dayNames[new Date(selectedDate + 'T12:00:00').getDay()];
        setSlots(therapist.availability?.[dow] || []);
      })
      .finally(() => setSlotsLoading(false));
  }, [selectedDate, therapist._id]);

  const priceForType = () => {
    const t = SESSION_TYPES.find((s) => s.key === sessionType);
    return Math.round(therapist.pricePerSession * (t?.priceMultiplier || 1));
  };

  const handleConfirm = async () => {
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const res = await sessionsAPI.create({
        therapistId: therapist._id,
        date: selectedDate,
        time: selectedTime,
        type: sessionType,
        duration,
        focusAreas,
      });
      setBookedSession(res.data.session);
      setStep(5); 
    } catch (err) {
      showToast(err.response?.data?.error || 'Booking failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = () => {
    if (step === 1) return !!sessionType && !!selectedDate;
    if (step === 2) return !!selectedTime;
    return true;
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        {}
        <div className="card-header">
          <span style={{ fontSize: 16, fontWeight: 500 }}>
            {step === 5 ? 'Booking confirmed!' : `Book a session — step ${step} of 4`}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>
            <i className="ti ti-x" />
          </button>
        </div>

        {}
        <div style={{ padding: '1.5rem' }}>
          {step < 5 && <StepBar current={step} total={4} />}
          <TherapistMini therapist={therapist} />

          {}
          {step === 1 && (
            <>
              <div className="form-group">
                <div className="form-label">Session format</div>
                <div className="session-type-grid">
                  {SESSION_TYPES.map((t) => (
                    <button
                      key={t.key}
                      className={`session-type-btn${sessionType === t.key ? ' selected' : ''}`}
                      onClick={() => setSessionType(t.key)}
                    >
                      <i className={`ti ${t.icon}`} style={{ color: t.color }} />
                      <div className="st-name">{t.label}</div>
                      <div className="st-price">
                        ${Math.round(therapist.pricePerSession * t.priceMultiplier)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <div className="form-label">Choose a date</div>
                <select
                  className="form-select"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                >
                  <option value="">Select a date…</option>
                  {dates.map((d) => (
                    <option key={d.toISOString()} value={format(d, 'yyyy-MM-dd')}>
                      {format(d, 'EEEE, MMMM d')}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {}
          {step === 2 && (
            <>
              <div className="form-group">
                <div className="form-label">
                  Available times for {selectedDate && format(new Date(selectedDate + 'T12:00:00'), 'MMMM d')}
                </div>
                {slotsLoading ? (
                  <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)' }}>
                    <div className="spinner" style={{ margin: '0 auto' }} />
                  </div>
                ) : slots.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '1rem' }}>
                    No slots available for this date. Please choose another day.
                  </div>
                ) : (
                  <div className="time-grid">
                    {slots.map((slot) => (
                      <button
                        key={slot}
                        className={`time-slot-btn${selectedTime === slot ? ' selected' : ''}`}
                        onClick={() => setSelectedTime(slot)}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-group">
                <div className="form-label">Session duration</div>
                <select
                  className="form-select"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                >
                  {DURATIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {}
          {step === 3 && (
            <div className="form-group">
              <div className="form-label">What would you like to focus on? (optional)</div>
              <textarea
                className="form-textarea"
                placeholder="Share any concerns, goals, or topics you'd like to cover in this session…"
                value={focusAreas}
                onChange={(e) => setFocusAreas(e.target.value)}
                style={{ height: 140 }}
              />
              <div className="form-hint">
                This helps your therapist prepare for your session.
              </div>
            </div>
          )}

          {}
          {step === 4 && (
            <div>
              <div style={{ background: 'var(--surface-1)', borderRadius: 10, padding: '1rem', marginBottom: '1rem' }}>
                <div className="confirm-row">
                  <span className="confirm-label">Therapist</span>
                  <span className="confirm-value">{therapist.name}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Date</span>
                  <span className="confirm-value">
                    {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
                  </span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Time</span>
                  <span className="confirm-value">{selectedTime}</span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Format</span>
                  <span className="confirm-value">
                    {SESSION_TYPES.find((t) => t.key === sessionType)?.label}
                  </span>
                </div>
                <div className="confirm-row">
                  <span className="confirm-label">Duration</span>
                  <span className="confirm-value">{duration} minutes</span>
                </div>
                <div className="divider" />
                <div className="confirm-row">
                  <span className="confirm-label">Session fee</span>
                  <span className="confirm-value" style={{ fontSize: 17, color: 'var(--teal)' }}>
                    ${priceForType()}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                By confirming, you agree to our cancellation policy. Sessions can be cancelled up to 24 hours before start time for a full refund.
              </p>
            </div>
          )}

          {}
          {step === 5 && bookedSession && (
            <div className="success-box">
              <div className="success-icon"><i className="ti ti-check" /></div>
              <h3 style={{ marginBottom: 8 }}>You're booked!</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {therapist.name}<br />
                {format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d')} at {selectedTime}
              </p>
              <button
                className="btn btn-primary mt-lg"
                onClick={() => { onClose(); navigate('/dashboard'); }}
              >
                <i className="ti ti-layout-dashboard" /> View dashboard
              </button>
            </div>
          )}
        </div>

        {}
        {step < 5 && (
          <div className="card-footer">
            {step > 1 ? (
              <button className="btn" onClick={() => setStep((s) => s - 1)}>
                <i className="ti ti-arrow-left" /> Back
              </button>
            ) : (
              <button className="btn" onClick={onClose}>Cancel</button>
            )}
            {step < 4 ? (
              <button
                className="btn btn-primary"
                disabled={!canNext()}
                onClick={() => setStep((s) => s + 1)}
              >
                Continue <i className="ti ti-arrow-right" />
              </button>
            ) : (
              <button
                className="btn btn-primary"
                disabled={submitting}
                onClick={handleConfirm}
              >
                {submitting ? (
                  <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Booking…</>
                ) : (
                  <><i className="ti ti-check" /> Confirm booking</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
 