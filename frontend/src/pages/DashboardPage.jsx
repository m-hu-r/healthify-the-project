import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sessionsAPI, authAPI } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { MOODS } from '../utils/constants.js';

function relativeDate(dateStr) {
  const d = new Date(dateStr);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  const days = differenceInDays(d, new Date());
  if (days > 0) return `In ${days} days`;
  return format(d, 'MMM d, yyyy');
}

function statusDot(status) {
  const map = { upcoming: 'dot-upcoming', completed: 'dot-completed', cancelled: 'dot-cancelled', 'in-progress': 'dot-in-progress' };
  return <div className={`session-dot ${map[status] || 'dot-completed'}`} />;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({ totalSessions: 0, upcoming: 0, completed: 0, totalHours: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedMood, setSelectedMood] = useState(null);
  const [loggingMood, setLoggingMood] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await sessionsAPI.list();
      setSessions(res.data.sessions);
      setStats(res.data.stats);
    } catch {
      showToast('Failed to load sessions', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const handleCancel = async (sessionId) => {
    if (!window.confirm('Cancel this session?')) return;
    try {
      await sessionsAPI.updateStatus(sessionId, { status: 'cancelled' });
      showToast('Session cancelled');
      fetchSessions();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to cancel session', 'error');
    }
  };

  const handleMoodLog = async (mood) => {
    setSelectedMood(mood.label);
    setLoggingMood(true);
    try {
      await authAPI.logMood({ mood: mood.label, emoji: mood.emoji });
      showToast(`Mood logged: ${mood.emoji} ${mood.label}`);
    } catch {
      showToast('Failed to log mood', 'error');
    } finally {
      setLoggingMood(false);
    }
  };

  const filteredSessions = sessions.filter((s) =>
    filter === 'all' ? true : s.status === filter
  );

  const nextSession = sessions
    .filter((s) => s.status === 'upcoming')
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  return (
    <div className="page">
      <div className="container">
        {}
        <div className="flex-between mb-lg">
          <div>
            <h2>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Link to="/therapists" className="btn btn-primary">
            <i className="ti ti-calendar-plus" /> Book session
          </Link>
        </div>

        {}
        <div className="grid-3 mb-lg">
          {[
            { label: 'Total sessions', value: stats.totalSessions, icon: 'ti-calendar', sub: 'since joining', color: 'var(--teal)' },
            { label: 'Hours of therapy', value: stats.totalHours, icon: 'ti-clock', sub: 'cumulative', color: 'var(--purple)' },
            { label: 'Upcoming', value: stats.upcoming, icon: 'ti-calendar-check', sub: 'scheduled', color: 'var(--amber)' },
          ].map((m) => (
            <div key={m.label} className="card card-body metric-card">
              <div className="metric-label">
                <i className={`ti ${m.icon}`} style={{ color: m.color }} /> {m.label}
              </div>
              <div className="metric-value" style={{ color: m.color }}>{m.value}</div>
              <div className="metric-sub">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="col-2-1">
          {}
          <div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Sessions</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['all','upcoming','completed','cancelled'].map((f) => (
                    <button
                      key={f}
                      className={`btn btn-sm${filter === f ? ' btn-primary' : ''}`}
                      style={{ textTransform: 'capitalize' }}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <div className="spinner" style={{ margin: '0 auto' }} />
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="empty-state">
                  <i className="ti ti-calendar-off" />
                  <h3>No {filter !== 'all' ? filter : ''} sessions</h3>
                  <p>{filter === 'all' ? "You haven't booked any sessions yet." : `No ${filter} sessions found.`}</p>
                  <Link to="/therapists" className="btn btn-primary">Find a therapist</Link>
                </div>
              ) : (
                filteredSessions.map((s) => (
                  <div
                    key={s._id}
                    className="session-item"
                    onClick={() => navigate(`/sessions/${s._id}`)}
                  >
                    {statusDot(s.status)}
                    <div
                      className="avatar"
                      style={{
                        width: 36, height: 36, fontSize: 12,
                        background: s.therapist?.avatarColor || 'var(--teal-light)',
                        color: s.therapist?.avatarTextColor || 'var(--teal)',
                      }}
                    >
                      {s.therapist?.avatar || '?'}
                    </div>
                    <div className="si-info">
                      <div className="si-name">{s.therapist?.name || 'Unknown therapist'}</div>
                      <div className="si-date">
                        <i className="ti ti-calendar" style={{ fontSize: 11 }} />{' '}
                        {format(new Date(s.date), 'MMM d, yyyy')} at {s.time}
                        {' · '}
                        <span style={{ textTransform: 'capitalize' }}>{s.type}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <span className={`badge badge-${s.status}`}>
                        {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                      </span>
                      {s.status === 'upcoming' && (
                        <button
                          className="btn btn-sm"
                          style={{ color: 'var(--coral)', borderColor: 'var(--coral)', padding: '3px 8px' }}
                          onClick={(e) => { e.stopPropagation(); handleCancel(s._id); }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {}
          <div>
            {}
            <div className="card mb-md">
              <div className="card-header">
                <span className="card-title"><i className="ti ti-clock" /> Next session</span>
                {nextSession && (
                  <span className="badge badge-upcoming">{relativeDate(nextSession.date)}</span>
                )}
              </div>
              <div className="card-body">
                {nextSession ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div
                        className="avatar"
                        style={{
                          width: 38, height: 38, fontSize: 13,
                          background: nextSession.therapist?.avatarColor || 'var(--teal-light)',
                          color: nextSession.therapist?.avatarTextColor || 'var(--teal)',
                        }}
                      >
                        {nextSession.therapist?.avatar || '?'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{nextSession.therapist?.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{nextSession.therapist?.title}</div>
                      </div>
                    </div>
                    <div className="next-session-time">
                      <i className="ti ti-calendar" /> {format(new Date(nextSession.date), 'EEE, MMM d')}
                    </div>
                    <div className="next-session-sub">
                      <i className="ti ti-clock" /> {nextSession.time} · {nextSession.duration} min · {nextSession.type}
                    </div>
                    <button className="btn btn-primary btn-full join-btn">
                      <i className="ti ti-video" /> Join session
                    </button>
                    <button
                      className="btn btn-full"
                      onClick={() => navigate(`/sessions/${nextSession._id}`)}
                    >
                      View details
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>No upcoming sessions</p>
                    <Link to="/therapists" className="btn btn-primary btn-sm">Book now</Link>
                  </div>
                )}
              </div>
            </div>

            {}
            <div className="card mb-md">
              <div className="card-header"><span className="card-title"><i className="ti ti-mood-smile" /> Log your mood</span></div>
              <div className="mood-grid">
                {MOODS.map((m) => (
                  <button
                    key={m.label}
                    className={`mood-btn${selectedMood === m.label ? ' active' : ''}`}
                    onClick={() => handleMoodLog(m)}
                    disabled={loggingMood}
                  >
                    <div className="mood-emoji">{m.emoji}</div>
                    <div className="mood-label-text">{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {}
            <div className="card">
              <div className="card-header"><span className="card-title">Quick actions</span></div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/therapists" className="qa-btn">
                  <i className="ti ti-calendar-plus" /> Book a session
                </Link>
                <Link to="/ai-support" className="qa-btn">
                  <i className="ti ti-message-circle" /> AI check-in
                </Link>
                <button className="qa-btn" onClick={() => navigate('/therapists')}>
                  <i className="ti ti-users" /> Browse therapists
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
