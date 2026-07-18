// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUserHistory } from '../services/interviewService';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import FirebaseRulesAlert from '../components/FirebaseRulesAlert';
import {
  Play, BarChart2, Clock, Trophy,
  TrendingUp, ChevronRight, Briefcase
} from 'lucide-react';

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function scoreColor(score) {
  if (score >= 8) return 'var(--color-accent-green)';
  if (score >= 5) return 'var(--color-accent-amber)';
  return 'var(--color-accent-rose)';
}

const ROLE_ICONS = {
  'Frontend Developer': '🎨',
  'Backend Developer': '⚙️',
  'Java Developer': '☕',
  'Python Developer': '🐍',
  'MERN Stack Developer': '🌐',
  'HR Interview': '🤝',
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate        = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [stats,      setStats]      = useState({
    total: 0, avg: 0, best: 0, streak: 0,
  });

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      try {
        const historyData = await fetchUserHistory(currentUser.uid);
        const data = historyData.map(d => ({
          id: d.id,
          role: d.interviewRole || d.role,
          difficulty: d.difficulty,
          createdAt: d.completedAt,
          finalReport: d.finalReport || { overallScore: d.totalScore || d.score || 0 },
          ...d
        }));
        setInterviews(data);

        if (data.length > 0) {
          const scores  = data.map(i => i.finalReport?.overallScore ?? 0);
          const avg     = +(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
          const best    = Math.max(...scores);
          setStats({ total: data.length, avg, best, streak: Math.min(data.length, 7) });
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        const msg = err?.message?.toLowerCase() || '';
        if (msg.includes('permission') || msg.includes('insufficient')) {
          setPermissionError(true);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [currentUser]);

  const firstName = currentUser?.displayName?.split(' ')[0] || currentUser?.email?.split('@')[0] || 'there';

  const STAT_CARDS = [
    {
      icon: <Briefcase size={22} />, label: 'Interviews Done',
      value: stats.total, color: '#6c63ff', glow: '#6c63ff',
    },
    {
      icon: <BarChart2 size={22} />, label: 'Average Score',
      value: `${stats.avg}/10`, color: '#38bdf8', glow: '#38bdf8',
    },
    {
      icon: <Trophy size={22} />, label: 'Best Score',
      value: `${stats.best}/10`, color: '#fbbf24', glow: '#fbbf24',
    },
    {
      icon: <TrendingUp size={22} />, label: 'Day Streak',
      value: stats.streak, color: '#34d399', glow: '#34d399',
    },
  ];

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="container">
        {permissionError && <FirebaseRulesAlert />}

        {/* ── Header ───────────────────────────────────── */}
        <div className="dashboard-header animate-slide-up">
          <p className="welcome-text">Welcome back 👋</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
            <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 800, margin: 0 }}>
              {firstName}
            </h1>
            <span className="badge badge-primary" style={{ background: '#EFF6FF', color: 'var(--color-accent-primary)', border: '1px solid rgba(37,99,235,0.2)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 700 }}>
              Demo Mode
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Ready to ace your next interview? Let's practice!
          </p>
        </div>

        {/* ── Stats ────────────────────────────────────── */}
        <div className="stats-grid stagger-children">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className="glass-card stat-card animate-slide-up">
              <div
                className="stat-card-icon"
                style={{
                  background: `rgba(${hexToRgb(card.color)}, 0.12)`,
                  color: card.color,
                }}
              >
                {card.icon}
              </div>
              <div className="stat-card-value" style={{ color: card.color }}>
                {loading ? '—' : card.value}
              </div>
              <div className="stat-card-label">{card.label}</div>
              <div className="stat-card-glow" style={{ background: card.glow }} />
            </div>
          ))}
        </div>

        {/* ── Start New Interview CTA ───────────────────── */}
        <div className="glass-card" style={{
          padding: 'var(--spacing-2xl)',
          marginBottom: 'var(--spacing-xl)',
          background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(56,189,248,0.06))',
          border: '1px solid rgba(108,99,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 'var(--spacing-lg)',
          animation: 'slideUp 0.6s ease 0.2s both',
        }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem' }}>
              Start a New Interview
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '480px' }}>
              Choose your role and difficulty, then answer 5 AI-generated questions with real-time feedback.
            </p>
          </div>
          <Link to="/setup" className="btn btn-primary btn-lg" id="dashboard-start-btn">
            <Play size={18} /> Start Interview
          </Link>
        </div>

        {/* ── Recent Interviews ─────────────────────────── */}
        <div style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-lg)' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Recent Interviews</h2>
            <Link to="/history" style={{
              display: 'flex', alignItems: 'center', gap: '0.25rem',
              fontSize: '0.875rem', color: 'var(--color-accent-secondary)',
            }}>
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading your interviews…" />
          ) : interviews.length === 0 ? (
            <div className="glass-card" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
              <h3 style={{ marginBottom: '0.5rem' }}>No interviews yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--spacing-lg)' }}>
                Your first interview will appear here once you complete it.
              </p>
              <Link to="/setup" className="btn btn-primary" id="empty-state-start-btn">
                <Play size={16} /> Start Your First Interview
              </Link>
            </div>
          ) : (
            <div>
              {interviews.slice(0, 5).map((interview) => (
                <div
                  key={interview.id}
                  className="glass-card history-card"
                  onClick={() => navigate(`/results/${interview.id}`)}
                  id={`interview-card-${interview.id}`}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 'var(--radius-md)',
                      background: 'rgba(108,99,255,0.1)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                      flexShrink: 0,
                    }}>
                      {ROLE_ICONS[interview.role] || '🎯'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{interview.role}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                        <span className={`badge badge-${interview.difficulty === 'Easy' ? 'success' : interview.difficulty === 'Medium' ? 'warning' : 'danger'}`}>
                          {interview.difficulty}
                        </span>
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={12} /> {formatDate(interview.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xl)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.5rem', fontWeight: 800,
                        color: scoreColor(interview.finalReport?.overallScore ?? 0),
                      }}>
                        {interview.finalReport?.overallScore ?? '—'}/10
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Overall</div>
                    </div>
                    <ChevronRight size={18} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper: hex → "r, g, b"
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}
