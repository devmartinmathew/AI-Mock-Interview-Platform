// src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  User, Mail, Trophy, BarChart2, Briefcase, Save,
  LogOut, AlertCircle, CheckCircle, Clock
} from 'lucide-react';


export default function Profile() {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [saving,      setSaving]      = useState(false);
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');
  const [stats,       setStats]       = useState({ total: 0, avg: 0, best: 0 });
  const [recent,      setRecent]      = useState(null);

  // Fetch stats
  useEffect(() => {
    async function load() {
      try {
        const q    = query(collection(db, 'interview_history'), where('userId', '==', currentUser.uid));
        const snap = await getDocs(q);
        const sortedData = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          .sort((a, b) => {
            const ta = a.completedAt?.seconds ?? 0;
            const tb = b.completedAt?.seconds ?? 0;
            return tb - ta;
          });
        if (sortedData.length > 0) {
          const scores = sortedData.map(i => i.totalScore ?? 0);
          const avg    = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
          const best   = Math.max(...scores);
          setStats({ total: sortedData.length, avg, best });
          setRecent(sortedData[0]);
        } else {
          setStats({ total: 0, avg: 0, best: 0 });
          setRecent(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [currentUser]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateUserProfile({ displayName: displayName.trim() || null });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  const initials = currentUser?.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="profile-page">
      <Navbar />

      <div className="container-sm">
        {/* Header */}
        <div className="animate-slide-up" style={{ padding: 'var(--spacing-2xl) 0 var(--spacing-xl)', textAlign: 'center' }}>
          <h1>Your <span className="gradient-text">Profile</span></h1>
        </div>

        {/* Avatar + Basic Info */}
        <div className="glass-card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, margin: '0 auto 1rem',
            boxShadow: '0 4px 12px rgba(37,99,235,0.15)',
            color: 'white',
          }}>
            {initials}
          </div>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
            {currentUser?.displayName || 'Anonymous User'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem' }}>
            <Mail size={14} /> {currentUser?.email}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: 'var(--spacing-lg)' }}>
          {[
            { icon: <Briefcase size={18} />, value: stats.total, label: 'Interviews', color: '#2563EB' },
            { icon: <BarChart2  size={18} />, value: `${stats.avg}/10`, label: 'Avg Score', color: '#3B82F6' },
            { icon: <Trophy     size={18} />, value: `${stats.best}/10`, label: 'Best Score', color: '#60A5FA' },
          ].map((s) => (
            <div key={s.label} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ color: s.color, marginBottom: '0.375rem', display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Recently Completed Interview */}
        {recent && (
          <div className="glass-card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="var(--color-accent-primary)" /> Recently Completed Interview
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                  {recent.interviewRole}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem', alignItems: 'center' }}>
                  <span className={`badge badge-${recent.difficulty === 'Easy' ? 'success' : recent.difficulty === 'Medium' ? 'warning' : 'danger'}`}>
                    {recent.difficulty}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {recent.completedAt ? new Date(recent.completedAt.seconds ? recent.completedAt.seconds * 1000 : recent.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-accent-primary)' }}>
                  {recent.totalScore}/10
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score</div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Name */}
        <div className="glass-card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={16} color="var(--color-accent-secondary)" /> Update Display Name
          </h3>

          {error   && <div className="error-msg"   style={{ marginBottom: '1rem' }}><AlertCircle  size={15} /> {error}</div>}
          {success && <div className="success-msg" style={{ marginBottom: '1rem' }}><CheckCircle  size={15} /> {success}</div>}

          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label className="form-label" htmlFor="profile-name">Display Name</label>
              <input
                id="profile-name"
                type="text"
                className="glass-input"
                placeholder="Your name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
              />
            </div>
            <button
              id="profile-save-btn"
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving…</>
              ) : (
                <><Save size={15} /> Save Changes</>
              )}
            </button>
          </form>
        </div>

        {/* Account Info */}
        <div className="glass-card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-lg)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Account Info</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email</span>
              <span>{currentUser?.email}</span>
            </div>
            <div className="divider" style={{ margin: '0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>User ID</span>
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {currentUser?.uid?.slice(0, 14)}…
              </span>
            </div>
            <div className="divider" style={{ margin: '0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Member Since</span>
              <span>
                {currentUser?.metadata?.creationTime
                  ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          className="btn btn-danger btn-block"
          onClick={handleLogout}
          id="profile-logout-btn"
          style={{ marginBottom: 'var(--spacing-3xl)' }}
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </div>
  );
}
