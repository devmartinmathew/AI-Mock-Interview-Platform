// src/pages/Results.jsx
import { useEffect, useState } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import { fetchInterviewById } from '../services/interviewService';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import FirebaseRulesAlert from '../components/FirebaseRulesAlert';
import {
  CheckCircle, AlertCircle, Lightbulb, TrendingUp, TrendingDown,
  BarChart2, LayoutDashboard, RotateCcw, ChevronDown, ChevronUp, List, FileText,
} from 'lucide-react';

function scoreColor(s) {
  if (s >= 8) return 'var(--color-accent-green)';
  if (s >= 5) return 'var(--color-accent-amber)';
  return 'var(--color-accent-rose)';
}

function hiringClass(rec) {
  if (!rec) return 'hiring-maybe';
  const r = rec.toLowerCase();
  if (r.includes('strong yes')) return 'hiring-yes';
  if (r.includes('yes'))        return 'hiring-yes';
  if (r.includes('strong no'))  return 'hiring-no';
  if (r.includes('no'))         return 'hiring-no';
  return 'hiring-maybe';
}

function hiringIcon(rec) {
  if (!rec) return '🤔';
  const r = rec.toLowerCase();
  if (r.includes('yes')) return '✅';
  if (r.includes('no'))  return '❌';
  return '🤔';
}

function CircleScore({ value, label, color }) {
  const r    = 36;
  const circ = 2 * Math.PI * r;
  const pct  = Math.max(0, Math.min(10, value ?? 0)) / 10;
  const dash = circ * pct;

  return (
    <div className="glass-card score-card" style={{ animation: 'scaleIn 0.5s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
        <svg width="90" height="90" viewBox="0 0 90 90">
          <circle cx="45" cy="45" r={r} fill="none" stroke="var(--glass-border)" strokeWidth="6" />
          <circle
            cx="45" cy="45" r={r} fill="none"
            stroke={color} strokeWidth="6"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            transform="rotate(-90 45 45)"
            style={{ transition: 'stroke-dasharray 1s ease' }}
          />
        </svg>
        <div style={{
          position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 90, height: 90,
        }}>
          <span style={{ fontSize: '1.35rem', fontWeight: 900, color }}>{value ?? '—'}</span>
        </div>
      </div>
      <div className="score-card-label">{label}</div>
    </div>
  );
}

// ── Per-question result for TEXT mode ─────────────────────────────────────
function TextResultItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const ev = item.evaluation;

  return (
    <div className="glass-card question-result-card" style={{ marginBottom: '0.75rem' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '1rem' }}
        onClick={() => setOpen(o => !o)}
        id={`result-q${index + 1}-toggle`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
          }}>
            Q{index + 1}
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', flex: 1 }}>
            {item.question}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: scoreColor(ev?.score ?? 0) }}>
            {ev?.score ?? '—'}/10
          </span>
          {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {open && (
        <div style={{ marginTop: '1rem', animation: 'slideUp 0.3s ease' }}>
          <div className="divider" style={{ margin: '0 0 1rem' }} />

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
              Your Answer
            </div>
            <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', background: 'var(--color-bg-primary)', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid var(--glass-border)' }}>
              {item.answer || <em>No answer provided</em>}
            </p>
          </div>

          {ev?.strengths?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent-green)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <TrendingUp size={12} /> Strengths
              </div>
              <ul className="feedback-list">
                {ev.strengths.map((s, i) => <li key={i}><CheckCircle size={12} color="var(--color-accent-green)" />{s}</li>)}
              </ul>
            </div>
          )}

          {ev?.weaknesses?.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent-rose)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <TrendingDown size={12} /> Areas to Improve
              </div>
              <ul className="feedback-list">
                {ev.weaknesses.map((w, i) => <li key={i}><AlertCircle size={12} color="var(--color-accent-rose)" />{w}</li>)}
              </ul>
            </div>
          )}

          {ev?.betterAnswer && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Lightbulb size={12} /> Model Answer
              </div>
              <div className="better-answer-box" style={{ fontSize: '0.9rem' }}>{ev.betterAnswer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Per-question result for MCQ mode ──────────────────────────────────────
function MCQResultItem({ item, index }) {
  const [open, setOpen] = useState(false);
  const ev = item.evaluation;
  const isCorrect = ev?.isCorrect;

  return (
    <div className="glass-card question-result-card" style={{ marginBottom: '0.75rem' }}>
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', gap: '1rem' }}
        onClick={() => setOpen(o => !o)}
        id={`result-q${index + 1}-toggle`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: isCorrect ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.18)',
            border: `2px solid ${isCorrect ? 'rgba(52,211,153,0.5)' : 'rgba(239,68,68,0.4)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {isCorrect
              ? <CheckCircle size={16} color="var(--color-accent-green)" />
              : <AlertCircle size={16} color="var(--color-accent-rose)" />}
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', flex: 1 }}>
            {item.question}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
          <span style={{
            padding: '0.2rem 0.7rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 700,
            background: isCorrect ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.12)',
            color: isCorrect ? 'var(--color-accent-green)' : 'var(--color-accent-rose)',
          }}>
            {isCorrect ? '✅ Correct' : '❌ Wrong'}
          </span>
          {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
        </div>
      </div>

      {open && (
        <div style={{ marginTop: '1rem', animation: 'slideUp 0.3s ease' }}>
          <div className="divider" style={{ margin: '0 0 1rem' }} />

          <div style={{ marginBottom: '0.875rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.5rem' }}>You selected:</span>
            <span style={{ color: isCorrect ? 'var(--color-accent-green)' : 'var(--color-accent-rose)', fontWeight: 700 }}>
              {ev?.selectedOption}
            </span>
            {!isCorrect && (
              <>
                <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>·</span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600, marginRight: '0.5rem' }}>Correct:</span>
                <span style={{ color: 'var(--color-accent-green)', fontWeight: 700 }}>{ev?.correctAnswer}</span>
              </>
            )}
          </div>

          {/* Explanation */}
          {ev?.betterAnswer && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-accent-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <Lightbulb size={12} /> Explanation
              </div>
              <div className="better-answer-box" style={{ fontSize: '0.9rem' }}>{ev.betterAnswer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Results page ─────────────────────────────────────────────────────
export default function Results() {
  const { id }   = useParams();
  const locState = useLocation().state;

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    if (locState?.saveFailed) {
      setPermissionError(true);
    }
  }, [locState]);

  useEffect(() => {
    async function load() {
      if (locState?.results) {
        setData(locState);
        setLoading(false);
        return;
      }
      if (!id || id === 'local') {
        setLoading(false);
        return;
      }
      try {
        const d = await fetchInterviewById(id);
        if (d) {
          setData({
            role:        d.interviewRole,
            difficulty:  d.difficulty,
            answerMode:  d.answerMode || 'text',
            finalReport: d.finalReport || {
              overallScore:        d.totalScore,
              communicationScore:  d.communicationScore,
              technicalScore:      d.technicalScore,
              confidenceScore:     d.confidenceScore,
              hiringRecommendation: d.hiringRecommendation,
              summary:             d.aiSummary || '',
              keyStrengths:        d.keyStrengths || [],
              areasForImprovement: d.areasForImprovement || [],
            },
            results:     (d.questions || []).map((q, i) => ({
              question:   q,
              answer:     d.answers?.[i] ?? '',
              evaluation: d.evaluations?.[i] ?? null,
            })),
          });
        }
      } catch (err) {
        console.error(err);
        const msg = err?.message?.toLowerCase() || '';
        if (msg.includes('permission') || msg.includes('insufficient')) {
          setPermissionError(true);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, locState]);

  if (loading) {
    return (
      <div className="results-page">
        <Navbar />
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner size="lg" text="Loading your results…" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="results-page">
        <Navbar />
        <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--color-accent-rose)" style={{ marginBottom: '1rem' }} />
          <h2>Results not found</h2>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { role, difficulty, answerMode = 'text', finalReport, results } = data;
  const isMCQ = answerMode === 'mcq';
  const fr    = finalReport || {};

  // Computed metrics
  const avgScore = fr.overallScore ?? (results?.length > 0
    ? +(results.reduce((a, r) => a + (r.evaluation?.score ?? 0), 0) / results.length).toFixed(1)
    : 0);

  const correctCount = isMCQ
    ? results?.filter(r => r.evaluation?.isCorrect).length ?? 0
    : null;
  const wrongCount = isMCQ ? (results?.length ?? 0) - correctCount : null;

  return (
    <div className="results-page">
      <Navbar />

      <div className="container-md">
        {permissionError && <FirebaseRulesAlert />}

        {/* ── Header ──────────────────────────────────── */}
        <div className="text-center animate-slide-up" style={{ padding: 'var(--spacing-2xl) 0 var(--spacing-xl)' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
            {avgScore >= 7 ? '🎉' : avgScore >= 4 ? '💪' : '📚'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <span className="badge badge-primary">Interview Complete</span>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
              background: isMCQ ? 'rgba(56,189,248,0.15)' : 'rgba(108,99,255,0.15)',
              color: isMCQ ? '#38bdf8' : '#6c63ff',
            }}>
              {isMCQ ? <List size={12} /> : <FileText size={12} />}
              {isMCQ ? 'Multiple Choice' : 'Text Answer'}
            </span>
          </div>
          <h1>Your Interview <span className="gradient-text">Report</span></h1>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
            {role} · {difficulty} Level
          </p>
        </div>

        {/* ── Hiring Recommendation ────────────────────── */}
        {fr.hiringRecommendation && (
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)', animation: 'scaleIn 0.5s ease 0.1s both' }}>
            <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Hiring Recommendation
            </div>
            <div className={`hiring-badge ${hiringClass(fr.hiringRecommendation)}`}>
              {hiringIcon(fr.hiringRecommendation)} {fr.hiringRecommendation}
            </div>
          </div>
        )}

        {/* ── MCQ Summary Stats ─────────────────────────── */}
        {isMCQ && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.875rem',
            marginBottom: 'var(--spacing-xl)', animation: 'scaleIn 0.5s ease 0.15s both',
          }}>
            {[
              { label: 'Total Score', value: `${avgScore * 10}%`, icon: '🏆', color: scoreColor(avgScore) },
              { label: 'Correct',     value: correctCount, icon: '✅', color: 'var(--color-accent-green)' },
              { label: 'Incorrect',   value: wrongCount,   icon: '❌', color: 'var(--color-accent-rose)' },
            ].map(s => (
              <div key={s.label} className="glass-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>{s.icon}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Score Cards ─────────────────────────────── */}
        <div className="result-scores-grid stagger-children" style={{ position: 'relative', marginBottom: 'var(--spacing-xl)' }}>
          <CircleScore value={fr.overallScore ?? avgScore} label="Overall Score" color="var(--color-accent-primary)" />
          <CircleScore value={fr.technicalScore}      label="Technical"      color="var(--color-accent-tertiary)" />
          <CircleScore value={fr.communicationScore}  label="Communication"  color="var(--color-accent-secondary)" />
          <CircleScore value={fr.confidenceScore}     label="Confidence"     color="var(--color-accent-green)" />
        </div>

        {/* ── AI Feedback / Summary ─────────────────────── */}
        {fr.summary && (
          <div className="glass-card" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)', animation: 'slideUp 0.5s ease 0.3s both' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={18} color="var(--color-accent-secondary)" /> AI Feedback
            </h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>{fr.summary}</p>
          </div>
        )}

        {/* ── Strengths & Improvements ─────────────────── */}
        {(fr.keyStrengths?.length > 0 || fr.areasForImprovement?.length > 0) && (
          <div className="grid-2" style={{ marginBottom: 'var(--spacing-xl)' }}>
            {fr.keyStrengths?.length > 0 && (
              <div className="glass-card" style={{ padding: 'var(--spacing-xl)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-accent-green)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={16} /> Key Strengths
                </h3>
                <ul className="feedback-list">
                  {fr.keyStrengths.map((s, i) => (
                    <li key={i}><CheckCircle size={14} color="var(--color-accent-green)" />{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {fr.areasForImprovement?.length > 0 && (
              <div className="glass-card" style={{ padding: 'var(--spacing-xl)' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-accent-rose)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingDown size={16} /> Areas to Improve
                </h3>
                <ul className="feedback-list">
                  {fr.areasForImprovement.map((a, i) => (
                    <li key={i}><AlertCircle size={14} color="var(--color-accent-rose)" />{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* ── Per-Question Breakdown ─────────────────────── */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 'var(--spacing-md)' }}>Question Breakdown</h2>
          {results?.map((item, i) =>
            isMCQ
              ? <MCQResultItem key={i} item={item} index={i} />
              : <TextResultItem key={i} item={item} index={i} />
          )}
        </div>

        {/* ── Actions ─────────────────────────────────── */}
        <div style={{
          display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: 'var(--spacing-3xl)',
        }}>
          <Link to="/dashboard" className="btn btn-ghost btn-lg" id="results-dashboard-btn">
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/setup" className="btn btn-primary btn-lg" id="results-retry-btn">
            <RotateCcw size={18} /> New Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
