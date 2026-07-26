import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const FEATURES = [
  { icon: 'ti-search', title: 'Find the right therapist', desc: 'Browse 150+ licensed therapists filtered by specialty, language, price, and session format.' },
  { icon: 'ti-calendar-check', title: 'Book in seconds', desc: 'Real-time availability, instant confirmation, and flexible scheduling that works around your life.' },
  { icon: 'ti-video', title: 'Session your way', desc: 'Video, phone, text chat, or in-person — choose the format that feels most comfortable for you.' },
  { icon: 'ti-message-circle', title: 'AI wellness support', desc: '24/7 AI companion for coping strategies, mood tracking, and session prep between appointments.' },
];

const TESTIMONIALS = [
  { text: 'Finding a therapist used to take weeks. I booked my first session in 5 minutes and felt supported immediately.', name: 'Anita R.', role: 'Using healthify for 6 months' },
  { text: 'The AI check-in feature is amazing for anxious moments between sessions. It feels like having support around the clock.', name: 'Marcus T.', role: 'Using healthify for 3 months' },
  { text: 'My therapist is incredible, and the session notes feature helps me track my progress over time.', name: 'Sarah K.', role: 'Using healthify for 1 year' },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div>
      {}
      <section style={{ background: 'var(--surface-2)', borderBottom: '0.5px solid var(--border)', padding: '5rem 0 4rem' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 14px', borderRadius: 20, background: 'var(--teal-light)',
            color: 'var(--teal)', fontSize: 13, fontWeight: 500, marginBottom: '1.5rem',
          }}>
            <i className="ti ti-shield-check" /> Safe, confidential &amp; licensed
          </div>
          <h1 style={{ marginBottom: '1.25rem', maxWidth: 640, margin: '0 auto 1.25rem' }}>
            Your mental health journey{' '}
            <span style={{ color: 'var(--teal)' }}>starts here</span>
          </h1>
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 540, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Connect with licensed therapists, book sessions in minutes, and track your progress — all in one compassionate platform.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/therapists" className="btn btn-primary btn-lg">
              <i className="ti ti-search" /> Find a therapist
            </Link>
            <Link to={user ? '/ai-support' : '/register'} className="btn btn-lg">
              <i className="ti ti-message-circle" /> Try AI support
            </Link>
          </div>
        </div>
      </section>

      {}
      <section style={{ padding: '3rem 0', background: 'var(--surface-0)' }}>
        <div className="container">
          <div className="grid-3" style={{ maxWidth: 600, margin: '0 auto' }}>
            {[
              { num: '150+', label: 'Licensed therapists' },
              { num: '4.9★', label: 'Average rating' },
              { num: '24/7', label: 'AI support available' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
                <div style={{ fontSize: 30, fontWeight: 500, color: 'var(--teal)', marginBottom: 4 }}>{s.num}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section style={{ padding: '4rem 0', background: 'var(--surface-2)', borderTop: '0.5px solid var(--border)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '0.75rem' }}>Everything you need</h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: 15 }}>
            A complete mental health platform built around you.
          </p>
          <div className="grid-2" style={{ maxWidth: 860, margin: '0 auto' }}>
            {FEATURES.map((f) => (
              <div key={f.title} className="card card-body" style={{ display: 'flex', gap: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: 'var(--teal-light)', color: 'var(--teal)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, flexShrink: 0,
                }}>
                  <i className={`ti ${f.icon}`} />
                </div>
                <div>
                  <h4 style={{ marginBottom: 4 }}>{f.title}</h4>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section style={{ padding: '4rem 0', background: 'var(--surface-0)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: '2.5rem' }}>What our members say</h2>
          <div className="grid-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card card-body">
                <div style={{ color: 'var(--amber)', marginBottom: 12, fontSize: 14 }}>★★★★★</div>
                <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16, color: 'var(--text-primary)' }}>
                  "{t.text}"
                </p>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section style={{ padding: '4rem 0', background: 'var(--teal)', color: '#fff', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Ready to start your journey?</h2>
          <p style={{ opacity: 0.85, fontSize: 15, marginBottom: '2rem' }}>
            Book your first session today. Same-day appointments often available.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/therapists" className="btn btn-lg" style={{ background: '#fff', color: 'var(--teal)', border: 'none' }}>
              Browse therapists
            </Link>
            {!user && (
              <Link to="/register" className="btn btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.4)' }}>
                Create free account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
