import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsAPI } from '../utils/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { format } from 'date-fns';

const TYPE_LABELS = { video: 'Video call', phone: 'Phone call', chat: 'Text chat', inperson: 'In-person' };

export default function SessionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingReview, setRatingReview] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchSession = useCallback(async () => {
    try {
      const res = await sessionsAPI.get(id);
      setSession(res.data.session);
      setNotes(res.data.session.notes || '');
      setRating(res.data.session.rating?.score || 0);
      setRatingReview(res.data.session.rating?.review || '');
    } catch {
      showToast('Session not found', 'error');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, showToast]);

  useEffect(() => { fetchSession(); }, [fetchSession]);

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      await sessionsAPI.saveNotes(id, notes);
      showToast('Notes saved');
    } catch {
      showToast('Failed to save notes', 'error');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this session?')) return;
    setCancelling(true);
    try {
      const res = await sessionsAPI.updateStatus(id, { status: 'cancelled' });
      setSession(res.data.session);
      showToast('Session cancelled');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to cancel session', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!rating) { showToast('Please select a rating', 'error'); return; }
    setSubmittingRating(true);
    try {
      const res = await sessionsAPI.rate(id, { score: rating, review: ratingReview });
      setSession(res.data.session);
      showToast('Rating submitted — thank you!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit rating', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!session) return null;

  const t = session.therapist;
  const sessionDate = new Date(session.date);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <button className="btn btn-ghost btn-sm mb-md" onClick={() => navigate('/dashboard')}>
          <i className="ti ti-arrow-left" /> Back to dashboard
        </button>

        {}
        <div className="card mb-md">
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div
              className="avatar avatar-lg"
              style={{ background: t?.avatarColor, color: t?.avatarTextColor, fontSize: 22 }}
            >
              {t?.avatar}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: 4 }}>{t?.name}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 10 }}>{t?.title}</p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="badge badge-upcoming" style={{ fontSize: 13 }}>
                  <i className="ti ti-calendar" /> {format(sessionDate, 'EEEE, MMMM d, yyyy')}
                </span>
                <span className="badge" style={{ background: 'var(--purple-light)', color: 'var(--purple)', fontSize: 13 }}>
                  <i className="ti ti-clock" /> {session.time}
                </span>
                <span className={`badge badge-${session.status}`} style={{ fontSize: 13 }}>
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 26, fontWeight: 500 }}>${session.price}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{TYPE_LABELS[session.type]}</div>
            </div>
          </div>
        </div>

        <div className="grid-2">
          {}
          <div>
            {}
            <div className="card mb-md">
              <div className="card-header"><span className="card-title"><i className="ti ti-video" /> Session room</span></div>
              <div className="card-body">
                <div className="video-placeholder">
                  <i className="ti ti-video-off" />
                  <div style={{ fontSize: 13 }}>
                    {session.status === 'upcoming' ? 'Session not started yet' : 'Session ended'}
                  </div>
                  {session.meetingLink && session.status === 'upcoming' && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{session.meetingLink}</div>
                  )}
                </div>
                {session.status === 'upcoming' && (
                  <button className="btn btn-primary btn-full" onClick={() => showToast('Opening video room…')}>
                    <i className="ti ti-video" /> Join video session
                  </button>
                )}
              </div>
            </div>

            {}
            <div className="card">
              <div className="card-header"><span className="card-title"><i className="ti ti-notebook" /> Session notes</span></div>
              <div className="card-body">
                <textarea
                  className="form-textarea"
                  style={{ height: 160 }}
                  placeholder="Add your notes, reflections, or goals for this session…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={session.status === 'cancelled'}
                />
              </div>
              <div className="card-footer">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveNotes}
                  disabled={savingNotes || session.status === 'cancelled'}
                >
                  {savingNotes ? <><span className="spinner" style={{ width: 12, height: 12, borderWidth: 2 }} /> Saving…</> : <><i className="ti ti-device-floppy" /> Save notes</>}
                </button>
              </div>
            </div>
          </div>

          {}
          <div>
            {}
            <div className="card mb-md">
              <div className="card-header"><span className="card-title"><i className="ti ti-info-circle" /> Details</span></div>
              <div className="card-body">
                {[
                  { label: 'Format', value: TYPE_LABELS[session.type] },
                  { label: 'Duration', value: `${session.duration} minutes` },
                  { label: 'Status', value: session.status.charAt(0).toUpperCase() + session.status.slice(1) },
                  { label: 'Booked', value: format(new Date(session.createdAt), 'MMM d, yyyy') },
                  ...(session.focusAreas ? [{ label: 'Focus areas', value: session.focusAreas }] : []),
                ].map((row) => (
                  <div key={row.label} className="confirm-row" style={{ borderBottom: '0.5px solid var(--border)' }}>
                    <span className="confirm-label">{row.label}</span>
                    <span className="confirm-value" style={{ maxWidth: '55%', textAlign: 'right', fontSize: 13 }}>{row.value}</span>
                  </div>
                ))}
              </div>
              {session.status === 'upcoming' && (
                <div className="card-footer">
                  <button
                    className="btn btn-danger btn-full"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling…' : <><i className="ti ti-x" /> Cancel session</>}
                  </button>
                </div>
              )}
            </div>

            {}
            {session.status === 'completed' && (
              <div className="card">
                <div className="card-header"><span className="card-title"><i className="ti ti-star" /> Rate this session</span></div>
                <div className="card-body">
                  {session.rating?.score ? (
                    <div>
                      <div style={{ fontSize: 22, color: 'var(--amber)', marginBottom: 8 }}>
                        {'★'.repeat(session.rating.score)}{'☆'.repeat(5 - session.rating.score)}
                      </div>
                      {session.rating.review && (
                        <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          "{session.rating.review}"
                        </p>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                        Submitted {format(new Date(session.rating.submittedAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="form-label">Your rating</div>
                      <div style={{ display: 'flex', gap: 6, fontSize: 28, marginBottom: 12 }}>
                        {[1,2,3,4,5].map((n) => (
                          <span
                            key={n}
                            style={{ cursor: 'pointer', color: n <= rating ? 'var(--amber)' : 'var(--border)' }}
                            onClick={() => setRating(n)}
                          >★</span>
                        ))}
                      </div>
                      <div className="form-group">
                        <div className="form-label">Review (optional)</div>
                        <textarea
                          className="form-textarea"
                          style={{ height: 80 }}
                          placeholder="Share your experience…"
                          value={ratingReview}
                          onChange={(e) => setRatingReview(e.target.value)}
                        />
                      </div>
                      <button
                        className="btn btn-primary btn-full"
                        onClick={handleSubmitRating}
                        disabled={submittingRating || !rating}
                      >
                        {submittingRating ? 'Submitting…' : 'Submit rating'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
