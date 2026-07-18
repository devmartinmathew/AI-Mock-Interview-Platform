// src/pages/InterviewSetup.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowRight, CheckCircle, FileText, List } from 'lucide-react';

const ROLES = [
  { id: 'frontend', label: 'Frontend Developer', icon: '🎨', desc: 'HTML, CSS, JS, React, Vue' },
  { id: 'backend',  label: 'Backend Developer',  icon: '⚙️', desc: 'APIs, Databases, Node, Go' },
  { id: 'java',     label: 'Java Developer',     icon: '☕', desc: 'Core Java, Spring Boot, JVM' },
  { id: 'python',   label: 'Python Developer',   icon: '🐍', desc: 'Python, Django, Flask, ML' },
  { id: 'mern',     label: 'MERN Stack Developer', icon: '🌐', desc: 'MongoDB, Express, React, Node' },
  { id: 'hr',       label: 'HR Interview',       icon: '🤝', desc: 'Behavioral, Soft Skills' },
];

const DIFFICULTIES = [
  {
    id: 'Easy',
    label: 'Easy',
    icon: '🌱',
    desc: 'Fundamentals & basics. Great for beginners.',
    color: '#34d399',
    selectedClass: 'selected-easy',
  },
  {
    id: 'Medium',
    label: 'Medium',
    icon: '🔥',
    desc: 'Intermediate concepts. Standard interviews.',
    color: '#fbbf24',
    selectedClass: 'selected-medium',
  },
  {
    id: 'Hard',
    label: 'Hard',
    icon: '⚡',
    desc: 'Advanced topics. Senior-level interviews.',
    color: '#f472b6',
    selectedClass: 'selected-hard',
  },
];

const ANSWER_MODES = [
  {
    id: 'text',
    label: 'Text Answer',
    icon: FileText,
    emoji: '✍️',
    desc: 'Type your answer. AI evaluates depth, accuracy & quality.',
    color: '#2563EB',
  },
  {
    id: 'mcq',
    label: 'Multiple Choice',
    icon: List,
    emoji: '🎯',
    desc: '4 options per question. Instant correct/wrong feedback.',
    color: '#3B82F6',
  },
];

export default function InterviewSetup() {
  const navigate     = useNavigate();
  const [role,       setRole]       = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [answerMode, setAnswerMode] = useState('text');

  function handleStart() {
    if (!role || !difficulty) return;
    navigate('/interview', { state: { role, difficulty, answerMode } });
  }

  const isReady = role && difficulty;

  return (
    <div className="setup-page">
      <Navbar />

      <div className="container-md">
        {/* Header */}
        <div className="text-center animate-slide-up" style={{ padding: 'var(--spacing-2xl) 0 var(--spacing-xl)' }}>
          <span className="badge badge-primary" style={{ marginBottom: '1rem' }}>
            Setup Interview
          </span>
          <h1>Choose Your <span className="gradient-text">Interview Track</span></h1>
          <p style={{ marginTop: '0.75rem', maxWidth: '500px', margin: '0.75rem auto 0' }}>
            Select a role, difficulty, and answer mode to begin your AI-powered interview.
          </p>
        </div>

        {/* ── Step 1: Role Selection ──────────────────────────── */}
        <div className="glass-card-static" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--gradient-primary)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
              color: 'white'
            }}>1</span>
            Select Your Role
          </h2>

          <div className="role-grid">
            {ROLES.map((r) => (
              <div
                key={r.id}
                className={`role-card ${role === r.label ? 'selected' : ''}`}
                onClick={() => setRole(r.label)}
                id={`role-${r.id}`}
              >
                {role === r.label && (
                  <CheckCircle size={16} color="var(--color-accent-primary)" style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                  }} />
                )}
                <span className="role-icon">{r.icon}</span>
                <div className="role-name">{r.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  {r.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 2: Difficulty Selection ─────────────────────── */}
        <div className="glass-card-static" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--gradient-primary)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
              color: 'white'
            }}>2</span>
            Choose Difficulty
          </h2>

          <div className="difficulty-grid">
            {DIFFICULTIES.map((d) => (
              <div
                key={d.id}
                className={`difficulty-card ${difficulty === d.id ? d.selectedClass : ''}`}
                onClick={() => setDifficulty(d.id)}
                id={`difficulty-${d.id.toLowerCase()}`}
              >
                {difficulty === d.id && (
                  <CheckCircle size={16} color={d.color} style={{
                    position: 'absolute', top: '0.75rem', right: '0.75rem',
                  }} />
                )}
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{d.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: difficulty === d.id ? d.color : 'var(--text-primary)', marginBottom: '0.25rem' }}>
                  {d.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{d.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 3: Answer Mode ────────────────────────────────── */}
        <div className="glass-card-static" style={{ padding: 'var(--spacing-xl)', marginBottom: 'var(--spacing-xl)' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--gradient-primary)', display: 'inline-flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700,
              color: 'white'
            }}>3</span>
            Answer Mode
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.875rem' }}>
            {ANSWER_MODES.map((m) => {
              const isSelected = answerMode === m.id;
              return (
                <div
                  key={m.id}
                  id={`mode-${m.id}`}
                  onClick={() => setAnswerMode(m.id)}
                  style={{
                    position: 'relative',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected
                      ? `2px solid ${m.color}`
                      : '2px solid var(--glass-border)',
                    background: isSelected
                      ? `linear-gradient(135deg, ${m.color}10, ${m.color}04)`
                      : 'var(--glass-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? `0 0 20px ${m.color}15` : 'none',
                  }}
                >
                  {isSelected && (
                    <CheckCircle size={16} color={m.color} style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                    }} />
                  )}
                  <div style={{ fontSize: '2rem', marginBottom: '0.625rem' }}>{m.emoji}</div>
                  <div style={{
                    fontWeight: 700, fontSize: '1rem', marginBottom: '0.375rem',
                    color: isSelected ? m.color : 'var(--text-primary)',
                  }}>
                    {m.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {m.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Summary & Start ──────────────────────────── */}
        {isReady && (
          <div className="glass-card" style={{
            padding: 'var(--spacing-xl)',
            marginBottom: 'var(--spacing-xl)',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(96,165,250,0.04))',
            border: '1px solid rgba(37,99,235,0.2)',
            animation: 'scaleIn 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>
                  Your Interview
                </div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  {role} — {difficulty} Level
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {answerMode === 'mcq'
                    ? '5 MCQ questions · 4 options each · Instant correct/wrong feedback'
                    : '5 open-ended questions · 60 seconds each · AI evaluation'}
                </div>
              </div>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleStart}
                id="start-interview-btn"
              >
                Begin Interview <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {!isReady && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', paddingBottom: 'var(--spacing-xl)' }}>
            Select a role and difficulty to continue
          </div>
        )}
      </div>
    </div>
  );
}
