// src/pages/History.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchUserHistory } from '../services/interviewService';
import FirebaseRulesAlert from '../components/FirebaseRulesAlert';
import { Clock, ChevronRight, Search, List, FileText, AlertCircle, ChevronLeft } from 'lucide-react';

const ROLE_ICONS = {
  'Frontend Developer':   '🎨',
  'Backend Developer':    '⚙️',
  'Java Developer':       '☕',
  'Python Developer':     '🐍',
  'MERN Stack Developer': '🌐',
  'HR Interview':         '🤝',
};

const ROLES = ['All', 'Frontend Developer', 'Backend Developer', 'Java Developer', 'Python Developer', 'MERN Stack Developer', 'HR Interview'];
const DIFFS = ['All', 'Easy', 'Medium', 'Hard'];
const ITEMS_PER_PAGE = 8;

function formatDate(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts.seconds ? ts.seconds * 1000 : ts);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function scoreColor(s) {
  if (s >= 8) return 'var(--color-accent-green)';
  if (s >= 5) return 'var(--color-accent-amber)';
  return 'var(--color-accent-rose)';
}

function hiringBadgeStyle(rec) {
  if (!rec) return {};
  const r = rec.toLowerCase();
  if (r.includes('strong yes') || r.includes('yes')) return { color: '#10B981', background: '#ECFDF5', border: '1px solid rgba(16,185,129,0.2)' };
  if (r.includes('no'))                               return { color: '#EF4444', background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.2)' };
  return { color: '#F59E0B', background: '#FFFBEB', border: '1px solid rgba(245,158,11,0.2)' };
}

export default function History() {
  const { currentUser } = useAuth();
  const navigate        = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [filtered,   setFiltered]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [diffFilter, setDiffFilter] = useState('All');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch from interview_history collection
  useEffect(() => {
    async function load() {
      if (!currentUser) return;
      setLoading(true);
      setFetchError('');
      try {
        const data = await fetchUserHistory(currentUser.uid);
        setInterviews(data);
        setFiltered(data);
      } catch (err) {
        console.error('[History] fetch error:', err);
        setFetchError(err?.message || 'Failed to load history.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentUser]);

  // Filter logic (resets current page to 1 when filters change)
  useEffect(() => {
    let result = [...interviews];
    if (roleFilter !== 'All') result = result.filter(i => i.interviewRole === roleFilter || i.role === roleFilter);
    if (diffFilter !== 'All') result = result.filter(i => i.difficulty === diffFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(i =>
        i.interviewRole?.toLowerCase().includes(s) ||
        i.role?.toLowerCase().includes(s) ||
        i.difficulty?.toLowerCase().includes(s) ||
        i.hiringRecommendation?.toLowerCase().includes(s) ||
        i.recommendation?.toLowerCase().includes(s)
      );
    }
    setFiltered(result);
    setCurrentPage(1);
  }, [interviews, roleFilter, diffFilter, search]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE) || 1;
  const paginatedData = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Navigate to report
  function openReport(interview) {
    const state = {
      role:        interview.interviewRole || interview.role,
      difficulty:  interview.difficulty,
      answerMode:  interview.answerMode || 'text',
      finalReport: interview.finalReport || {
        overallScore:        interview.totalScore || interview.score,
        communicationScore:  interview.communicationScore,
        technicalScore:      interview.technicalScore,
        confidenceScore:     interview.confidenceScore,
        hiringRecommendation: interview.hiringRecommendation || interview.recommendation,
        summary:             interview.aiSummary || '',
        keyStrengths:        interview.keyStrengths || [],
        areasForImprovement: interview.areasForImprovement || [],
      },
      results: (interview.questions || []).map((q, i) => ({
        question:   q,
        answer:     interview.answers?.[i]     ?? '',
        evaluation: interview.evaluations?.[i] ?? null,
      })),
    };
    navigate(`/results/${interview.id}`, { state });
  }

  const isPermissionError = fetchError?.toLowerCase().includes('permission') || fetchError?.toLowerCase().includes('insufficient');

  return (
    <div className="history-page">
      <Navbar />

      <div className="container-md">
        {/* Header */}
        <div className="animate-slide-up" style={{ padding: 'var(--spacing-2xl) 0 var(--spacing-xl)' }}>
          <h1>Interview <span className="gradient-text">History</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {loading ? 'Loading…' : `${filtered.length} of ${interviews.length} completed interviews`}
          </p>
        </div>

        {/* Error Banner */}
        {fetchError && (
          isPermissionError ? (
            <FirebaseRulesAlert />
          ) : (
            <div style={{
              background: '#FEF2F2', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem',
              marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            }}>
              <AlertCircle size={20} color="var(--color-accent-rose)" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <div>
                <div style={{ fontWeight: 600, color: 'var(--color-accent-rose)', marginBottom: '0.25rem' }}>
                  Could not load history
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {fetchError}
                </div>
              </div>
            </div>
          )
        )}

        {/* Search and Filters */}
        <div className="glass-card-static" style={{ padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="history-search"
                type="text"
                className="glass-input"
                placeholder="Search by role, difficulty…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem', padding: '0.625rem 1rem 0.625rem 2.5rem' }}
              />
            </div>

            {/* Role select */}
            <select
              id="history-role-filter"
              className="glass-input"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              style={{ width: 'auto', padding: '0.625rem 1rem', cursor: 'pointer' }}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Difficulty select */}
            <select
              id="history-diff-filter"
              className="glass-input"
              value={diffFilter}
              onChange={e => setDiffFilter(e.target.value)}
              style={{ width: 'auto', padding: '0.625rem 1rem', cursor: 'pointer' }}
            >
              {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* List (Table with white rows) */}
        {loading ? (
          <LoadingSpinner text="Loading history…" />
        ) : filtered.length === 0 && !fetchError ? (
          <div className="glass-card" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {interviews.length === 0 ? '🎯' : '🔍'}
            </div>
            <h3>{interviews.length === 0 ? 'No interviews yet' : 'No results match your filters'}</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {interviews.length === 0
                ? 'Complete your first interview to see it here.'
                : 'Try adjusting your search or filter.'}
            </p>
            {interviews.length === 0 && (
              <button
                className="btn btn-primary"
                style={{ marginTop: '1.5rem' }}
                onClick={() => navigate('/setup')}
              >
                Start an Interview
              </button>
            )}
          </div>
        ) : (
          <div className="flex-col gap-md">
            {/* Table Container */}
            <div className="glass-card-static" style={{ overflowX: 'auto', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-tertiary)', borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '1rem var(--spacing-lg)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Track / Role</th>
                    <th style={{ padding: '1rem var(--spacing-lg)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Completed At</th>
                    <th style={{ padding: '1rem var(--spacing-lg)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Difficulty</th>
                    <th style={{ padding: '1rem var(--spacing-lg)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Format</th>
                    <th style={{ padding: '1rem var(--spacing-lg)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Recommendation</th>
                    <th style={{ padding: '1rem var(--spacing-lg)', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textAlign: 'right' }}>Score</th>
                    <th style={{ padding: '1rem var(--spacing-lg)', width: '50px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((interview) => (
                    <tr
                      key={interview.id}
                      className="history-table-row"
                      onClick={() => openReport(interview)}
                      style={{
                        borderBottom: '1px solid var(--glass-border)',
                        cursor: 'pointer',
                        background: '#FFFFFF',
                      }}
                      id={`history-item-${interview.id}`}
                    >
                      {/* Role & Icon */}
                      <td style={{ padding: '1rem var(--spacing-lg)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>
                            {ROLE_ICONS[interview.interviewRole] || '🎯'}
                          </span>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {interview.interviewRole}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '1rem var(--spacing-lg)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        {formatDate(interview.completedAt)}
                      </td>

                      {/* Difficulty badge */}
                      <td style={{ padding: '1rem var(--spacing-lg)' }}>
                        <span className={`badge badge-${interview.difficulty === 'Easy' ? 'success' : interview.difficulty === 'Medium' ? 'warning' : 'danger'}`}>
                          {interview.difficulty}
                        </span>
                      </td>

                      {/* Answer format pill */}
                      <td style={{ padding: '1rem var(--spacing-lg)' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: interview.answerMode === 'mcq' ? '#EFF6FF' : '#EFF6FF',
                          color: 'var(--color-accent-primary)',
                          border: '1px solid rgba(37,99,235,0.15)',
                        }}>
                          {interview.answerMode === 'mcq' ? <List size={11} /> : <FileText size={11} />}
                          {interview.answerMode === 'mcq' ? 'MCQ' : 'Text'}
                        </span>
                      </td>

                      {/* Recommendation */}
                      <td style={{ padding: '1rem var(--spacing-lg)' }}>
                        {interview.hiringRecommendation && interview.hiringRecommendation !== 'N/A' ? (
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-full)',
                            display: 'inline-block',
                            ...hiringBadgeStyle(interview.hiringRecommendation),
                          }}>
                            {interview.hiringRecommendation}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>

                      {/* Score */}
                      <td style={{ padding: '1rem var(--spacing-lg)', textAlign: 'right', fontWeight: 800, fontSize: '1.05rem', color: scoreColor(interview.totalScore ?? 0) }}>
                        {interview.totalScore ?? '—'}/10
                      </td>

                      {/* Arrow */}
                      <td style={{ padding: '1rem var(--spacing-lg)', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <ChevronRight size={18} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 'var(--spacing-md)',
                padding: '0.5rem 0',
              }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{ gap: '0.25rem' }}
                >
                  <ChevronLeft size={16} /> Prev
                </button>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isCurrent = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          border: 'none',
                          background: isCurrent ? 'var(--color-accent-primary)' : 'transparent',
                          color: isCurrent ? '#FFFFFF' : 'var(--text-secondary)',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{ gap: '0.25rem' }}
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
