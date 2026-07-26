import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { therapistsAPI } from '../utils/api.js';
import BookingModal from '../components/BookingModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const SPECIALTIES = ['All', 'Anxiety', 'Depression', 'Relationships', 'Trauma', 'CBT', 'Mindfulness', 'Grief', 'PTSD', 'Self-esteem'];
const SORT_OPTIONS = [
  { value: '',           label: 'Best match' },
  { value: 'rating',    label: 'Highest rated' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc',label: 'Price: high to low' },
];

function TherapistCard({ therapist, onBook }) {
  const navigate = useNavigate();
  return (
    <div className="card therapist-card" onClick={() => navigate(`/therapists/${therapist._id}`)}>
      <div className="card-body">
        <div className="tc-header">
          <div
            className="avatar avatar-md"
            style={{ background: therapist.avatarColor, color: therapist.avatarTextColor }}
          >
            {therapist.avatar}
          </div>
          <div style={{ flex: 1 }}>
            <div className="tc-name">{therapist.name}</div>
            <div className="tc-title">{therapist.title}</div>
          </div>
        </div>

        <div className="tc-rating">
          <i className="ti ti-star-filled" />
          {therapist.rating}
          <span style={{ color: 'var(--text-secondary)' }}>({therapist.reviewCount} reviews)</span>
        </div>

        <div className="tc-tags">
          {therapist.specialties.slice(0, 4).map((s) => (
            <span key={s} className="tag">{s}</span>
          ))}
          {therapist.specialties.length > 4 && (
            <span className="tag">+{therapist.specialties.length - 4}</span>
          )}
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.5 }}>
          {therapist.bio.length > 100 ? therapist.bio.slice(0, 100) + '…' : therapist.bio}
        </div>

        <div className="tc-footer">
          <div>
            <div className="tc-price">${therapist.pricePerSession}<span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-secondary)' }}>/session</span></div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              {therapist.sessionTypes?.map((t) => (
                <span key={t} style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  {t === 'video' ? '📹' : t === 'phone' ? '📞' : t === 'chat' ? '💬' : '🏢'}
                </span>
              ))}
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => { e.stopPropagation(); onBook(therapist); }}
          >
            <i className="ti ti-calendar-plus" /> Book
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card">
      <div className="card-body">
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div className="skeleton" style={{ width: 44, height: 44, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ height: 14, width: '60%', marginBottom: 6 }} />
            <div className="skeleton" style={{ height: 12, width: '80%' }} />
          </div>
        </div>
        <div className="skeleton" style={{ height: 12, width: '40%', marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 22, width: 60, borderRadius: 20 }} />)}
        </div>
        <div className="skeleton" style={{ height: 12, marginBottom: 4 }} />
        <div className="skeleton" style={{ height: 12, width: '80%' }} />
      </div>
    </div>
  );
}

export default function TherapistsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [specialty, setSpecialty] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [bookingTarget, setBookingTarget] = useState(null);

  const fetchTherapists = useCallback(async () => {
    setLoading(true);
    try {
      const params = { sort };
      if (specialty !== 'All') params.specialty = specialty;
      if (search.trim()) params.search = search.trim();
      const res = await therapistsAPI.list(params);
      setTherapists(res.data.therapists);
    } catch {
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  }, [specialty, sort, search]);

  useEffect(() => {
    const timer = setTimeout(fetchTherapists, 300);
    return () => clearTimeout(timer);
  }, [fetchTherapists]);

  const handleBook = (therapist) => {
    if (!user) { navigate('/login'); return; }
    setBookingTarget(therapist);
  };

  return (
    <div className="page">
      <div className="container">
        {}
        <div className="flex-between mb-lg">
          <div>
            <h2>Find a therapist</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
              {loading ? 'Loading…' : `${therapists.length} therapist${therapists.length !== 1 ? 's' : ''} available`}
            </p>
          </div>
          <select
            className="form-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ width: 180 }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {}
        <div style={{ position: 'relative', marginBottom: '1rem' }}>
          <i className="ti ti-search" style={{
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', fontSize: 16,
          }} />
          <input
            className="form-input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by name, specialty, or approach…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {}
        <div className="filters">
          {SPECIALTIES.map((s) => (
            <button
              key={s}
              className={`filter-chip${specialty === s ? ' active' : ''}`}
              onClick={() => setSpecialty(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {}
        {loading ? (
          <div className="grid-auto">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : therapists.length === 0 ? (
          <div className="empty-state">
            <i className="ti ti-users-off" />
            <h3>No therapists found</h3>
            <p>Try adjusting your filters or search query.</p>
            <button className="btn btn-primary" onClick={() => { setSpecialty('All'); setSearch(''); }}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid-auto">
            {therapists.map((t) => (
              <TherapistCard key={t._id} therapist={t} onBook={handleBook} />
            ))}
          </div>
        )}
      </div>

      {bookingTarget && (
        <BookingModal therapist={bookingTarget} onClose={() => setBookingTarget(null)} />
      )}
    </div>
  );
}
