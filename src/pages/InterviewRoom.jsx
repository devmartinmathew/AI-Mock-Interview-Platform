// src/pages/InterviewRoom.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import {
  generateQuestions, evaluateAnswer, generateFinalReport, generateMCQQuestion,
} from '../services/gemini';
import { saveInterviewHistory } from '../services/interviewService';
import {
  Clock, ChevronRight, CheckCircle, AlertCircle,
  Lightbulb, TrendingUp, TrendingDown, Brain, List, FileText,
} from 'lucide-react';

const TOTAL_QUESTIONS   = 5;
const TIME_PER_QUESTION = 60; // seconds (text mode only)

export default function InterviewRoom() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { currentUser } = useAuth();

  const { role, difficulty, answerMode = 'text' } = location.state || {};
  const isMCQ = answerMode === 'mcq';

  // Redirect if missing setup
  useEffect(() => {
    if (!role || !difficulty) navigate('/setup', { replace: true });
  }, [role, difficulty, navigate]);

  // ── Shared State ──────────────────────────────────────────
  const [phase,        setPhase]        = useState('loading');
  const [currentQ,     setCurrentQ]     = useState(0);
  const [results,      setResults]      = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [evaluation,   setEvaluation]   = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState('');

  // ── Text-mode State ───────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [answer,    setAnswer]    = useState('');
  const [timeLeft,  setTimeLeft]  = useState(TIME_PER_QUESTION);

  // ── MCQ-mode State ────────────────────────────────────────
  const [mcqData,        setMcqData]        = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [mcqSubmitted,   setMcqSubmitted]   = useState(false);
  const [mcqHistory,     setMcqHistory]     = useState([]);

  // ── Duplicate-save guard ──────────────────────────────────
  // Prevents re-saving if the component remounts or Results page is refreshed
  const savedRef = useRef(false);

  const timerRef  = useRef(null);
  const answerRef = useRef(answer);
  answerRef.current = answer;

  // ── Load: TEXT mode ───────────────────────────────────────
  useEffect(() => {
    if (!role || !difficulty || isMCQ) return;
    async function load() {
      try {
        const qs = await generateQuestions(role, difficulty);
        setQuestions(qs);
        setPhase('interview');
      } catch (err) {
        const msg = err?.message || String(err);
        console.error('[InterviewRoom] Question generation failed:', msg);
        setError(msg);
        setPhase('error');
      }
    }
    load();
  }, [role, difficulty, isMCQ]);

  // ── Load: MCQ mode ────────────────────────────────────────
  useEffect(() => {
    if (!role || !difficulty || !isMCQ) return;
    loadMCQQuestion(0, []);
  }, [role, difficulty, isMCQ]); // eslint-disable-line

  async function loadMCQQuestion(index, prevQs) {
    setPhase('loading');
    setSelectedOption('');
    setMcqSubmitted(false);
    setEvaluation(null);
    setShowFeedback(false);
    try {
      const data = await generateMCQQuestion(role, difficulty, index, prevQs);
      setMcqData(data);
      setMcqHistory(prev => [...prev, data.question]);
      setPhase('interview');
    } catch (err) {
      const msg = err?.message || String(err);
      console.error('[InterviewRoom] MCQ generation failed:', msg);
      setError(msg);
      setPhase('error');
    }
  }

  // ── Timer (text mode only) ─────────────────────────────────
  const handleTimeUp = useCallback(() => {
    clearInterval(timerRef.current);
    handleSubmitTextAnswer(true);
  }, [currentQ, questions]); // eslint-disable-line

  useEffect(() => {
    if (isMCQ || phase !== 'interview' || showFeedback) return;
    setTimeLeft(TIME_PER_QUESTION);

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentQ, phase, showFeedback, isMCQ]); // eslint-disable-line

  // ── Submit: TEXT mode ─────────────────────────────────────
  async function handleSubmitTextAnswer(timedOut = false) {
    clearInterval(timerRef.current);
    const currentAnswer = answerRef.current;
    setPhase('evaluating');

    try {
      const ev = await evaluateAnswer(questions[currentQ], currentAnswer, role, difficulty);
      setEvaluation(ev);
      setResults(prev => [...prev, {
        question:   questions[currentQ],
        answer:     currentAnswer,
        evaluation: ev,
      }]);
      setShowFeedback(true);
      setPhase('interview');
    } catch (err) {
      console.error('Evaluation error:', err);
      const placeholder = {
        score: 5, strengths: ['Answer submitted'], weaknesses: ['Could not evaluate'],
        betterAnswer: 'AI evaluation unavailable. Please check your API key.',
      };
      setEvaluation(placeholder);
      setResults(prev => [...prev, {
        question:   questions[currentQ],
        answer:     currentAnswer,
        evaluation: placeholder,
      }]);
      setShowFeedback(true);
      setPhase('interview');
    }
  }

  // ── Submit: MCQ mode ──────────────────────────────────────
  function handleSubmitMCQ() {
    if (!selectedOption) return;
    const isCorrect = selectedOption === mcqData.correctAnswer;
    const score     = isCorrect ? 10 : 0;
    const ev = {
      isCorrect,
      score,
      selectedOption,
      correctAnswer: mcqData.correctAnswer,
      explanation:   mcqData.explanation,
      strengths:     isCorrect ? ['Correct answer selected'] : [],
      weaknesses:    isCorrect ? [] : [`Correct answer was ${mcqData.correctAnswer}: ${mcqData.options[mcqData.correctAnswer]}`],
      betterAnswer:  mcqData.explanation,
    };
    setEvaluation(ev);
    setResults(prev => [...prev, {
      question:   mcqData.question,
      answer:     `${selectedOption}: ${mcqData.options[selectedOption]}`,
      evaluation: ev,
      mcqOptions: mcqData.options,
    }]);
    setMcqSubmitted(true);
    setShowFeedback(true);
  }

  // ── Finish interview: generate report + save to Firestore ─
  async function finishInterview(allResults) {
    // Guard against duplicate saves (e.g. double-click or remount)
    if (savedRef.current) return;
    savedRef.current = true;

    setSaving(true);
    setPhase('done');

    try {
      // 1. Generate final AI report
      const finalReport = await generateFinalReport(role, difficulty, allResults, answerMode);

      // 2. Save to Firestore interview_history
      let docId = null;
      let saveFailed = false;
      try {
        docId = await saveInterviewHistory({
          userId:    currentUser.uid,
          userEmail: currentUser.email,
          role,
          difficulty,
          answerMode,
          finalReport,
          results:   allResults,
        });
      } catch (firestoreErr) {
        // Firestore save failed — still show results from state
        console.error('[InterviewRoom] Firestore save failed:', firestoreErr?.message);
        saveFailed = true;
        docId = firestoreErr.localId || null;
      }

      navigate(docId ? `/results/${docId}` : '/results/local', {
        state: { results: allResults, finalReport, role, difficulty, answerMode, saveFailed },
      });
    } catch (err) {
      console.error('[InterviewRoom] Final report generation failed:', err);
      // Navigate with what we have — no finalReport
      navigate('/results/local', {
        state: { results: allResults, finalReport: null, role, difficulty, answerMode, saveFailed: true },
      });
    }
  }

  // ── Next Question / Finish ────────────────────────────────
  async function handleNext() {
    const isLast = currentQ === TOTAL_QUESTIONS - 1;

    if (isLast) {
      await finishInterview(results);
    } else {
      const nextQ = currentQ + 1;
      setCurrentQ(nextQ);
      setAnswer('');
      setShowFeedback(false);
      setEvaluation(null);

      if (isMCQ) {
        loadMCQQuestion(nextQ, mcqHistory);
      }
    }
  }

  // ── Progress ──────────────────────────────────────────────
  const progress    = ((currentQ + (showFeedback ? 1 : 0)) / TOTAL_QUESTIONS) * 100;
  const isUrgent    = !isMCQ && timeLeft <= 10 && !showFeedback;
  const curQuestion = isMCQ ? mcqData?.question : questions[currentQ];

  // ─────────────────────────────────────────────────────────
  // Error screen
  // ─────────────────────────────────────────────────────────
  if (phase === 'error') {
    const isApiKeyError = error?.toLowerCase().includes('api key') ||
                          error?.toLowerCase().includes('api_key_invalid') ||
                          error?.toLowerCase().includes('not configured');
    return (
      <div className="interview-page">
        <Navbar />
        <div className="container-md" style={{ paddingTop: 'var(--spacing-2xl)' }}>
          <div className="glass-card" style={{ padding: 'var(--spacing-2xl)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' }}>
              <AlertCircle size={48} color="var(--color-accent-rose)" style={{ marginBottom: '1rem' }} />
              <h2>Gemini API Error</h2>
            </div>
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem',
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fca5a5', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Error Detail
              </div>
              <pre style={{ fontSize: '0.8125rem', color: '#fca5a5', whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, fontFamily: 'monospace' }}>
                {error}
              </pre>
            </div>
            {isApiKeyError && (
              <div style={{
                background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)',
                borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem',
                fontSize: '0.9rem', color: 'var(--color-accent-amber)',
              }}>
                <strong>💡 Fix:</strong> Open your <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>.env</code> file and set{' '}
                <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>VITE_GEMINI_API_KEY</code> to a valid key from{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-amber)', textDecoration: 'underline' }}>
                  aistudio.google.com
                </a>.
              </div>
            )}
            <button className="btn btn-primary" onClick={() => navigate('/setup')} style={{ display: 'block', margin: '0 auto' }}>
              ← Back to Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Loading screen
  // ─────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="interview-page">
        <Navbar />
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'rgba(37,99,235,0.1)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
              animation: 'glow 2s ease-in-out infinite',
            }}>
              <Brain size={36} color="var(--color-accent-primary)" />
            </div>
            <h2 style={{ marginBottom: '0.75rem' }}>
              {isMCQ ? `Generating Question ${currentQ + 1}…` : 'Generating Your Questions…'}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {isMCQ
                ? `Gemini AI is crafting MCQ ${currentQ + 1} of ${TOTAL_QUESTIONS} for ${role}.`
                : `Gemini AI is crafting ${TOTAL_QUESTIONS} tailored ${role} questions at ${difficulty} level.`}
            </p>
            <div className="spinner spinner-lg" style={{ margin: '2rem auto 0' }} />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Saving / Done screen
  // ─────────────────────────────────────────────────────────
  if (phase === 'done') {
    return (
      <div className="interview-page">
        <Navbar />
        <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
            <h2>Interview Complete!</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Generating your report &amp; saving to history…
            </p>
            <div className="spinner spinner-lg" style={{ margin: '2rem auto 0' }} />
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // Main interview UI
  // ─────────────────────────────────────────────────────────
  return (
    <div className="interview-page">
      <Navbar />

      <div className="container-md">
        {/* ── Header ──────────────────────────────────── */}
        <div className="interview-header">
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {role} · {difficulty}
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
                padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                background: isMCQ ? 'rgba(59,130,246,0.15)' : 'rgba(37,99,235,0.15)',
                color: isMCQ ? '#3B82F6' : '#2563EB',
              }}>
                {isMCQ ? <List size={11} /> : <FileText size={11} />}
                {isMCQ ? 'MCQ' : 'Text'}
              </span>
            </div>
            <h2 style={{ fontSize: '1.2rem' }}>
              Question {currentQ + 1} of {TOTAL_QUESTIONS}
            </h2>
          </div>

          {!isMCQ && !showFeedback && (
            <div className={`timer-display ${isUrgent ? 'urgent' : ''}`}>
              <Clock size={16} />
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          )}
        </div>

        {/* ── Progress Bar ─────────────────────────────── */}
        <div className="progress-bar" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* ── Question Card ─────────────────────────────── */}
        {curQuestion && (
          <div className="glass-card question-card" style={{ animation: 'slideUp 0.4s ease' }}>
            <div className="question-number">Question {currentQ + 1}</div>
            <p className="question-text">{curQuestion}</p>
          </div>
        )}

        {/* ════════════════════════════
            TEXT MODE: textarea
            ════════════════════════════ */}
        {!isMCQ && !showFeedback && phase !== 'evaluating' && (
          <div style={{ animation: 'slideUp 0.4s ease 0.1s both' }}>
            <div className="form-group" style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label className="form-label" htmlFor="answer-input">Your Answer</label>
              <textarea
                id="answer-input"
                className="glass-input"
                rows={6}
                placeholder="Type your answer here… Be as detailed as you can."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                style={{ minHeight: '160px' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => handleSubmitTextAnswer(false)}
                id="submit-answer-btn"
              >
                Submit Answer <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════
            MCQ MODE: radio options
            ════════════════════════════ */}
        {isMCQ && mcqData && !mcqSubmitted && (
          <div style={{ animation: 'slideUp 0.4s ease 0.1s both' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: 'var(--spacing-lg)' }}>
              {Object.entries(mcqData.options).map(([key, value]) => (
                <label
                  key={key}
                  htmlFor={`mcq-option-${key}`}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.875rem',
                    padding: '1rem 1.25rem',
                    borderRadius: 'var(--radius-lg)',
                    border: selectedOption === key ? '2px solid var(--color-accent-primary)' : '2px solid var(--glass-border)',
                    background: selectedOption === key ? 'rgba(37,99,235,0.08)' : 'var(--glass-bg)',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease',
                    boxShadow: selectedOption === key ? '0 0 16px rgba(37,99,235,0.12)' : 'none',
                  }}
                >
                  <input
                    type="radio"
                    id={`mcq-option-${key}`}
                    name="mcq-option"
                    value={key}
                    checked={selectedOption === key}
                    onChange={() => setSelectedOption(key)}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                    border: selectedOption === key ? '2px solid var(--color-accent-primary)' : '2px solid var(--glass-border)',
                    background: selectedOption === key ? 'var(--color-accent-primary)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginTop: '0.1rem', transition: 'all 0.18s ease',
                  }}>
                    {selectedOption === key && (
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: selectedOption === key ? 'var(--color-accent-primary)' : 'var(--text-muted)', marginRight: '0.5rem' }}>{key}.</span>
                    <span style={{ fontSize: '0.9375rem', color: 'var(--text-primary)' }}>{value}</span>
                  </div>
                </label>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={handleSubmitMCQ}
                disabled={!selectedOption}
                id="submit-answer-btn"
                style={{ opacity: selectedOption ? 1 : 0.5 }}
              >
                Submit Answer <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════
            MCQ FEEDBACK
            ════════════════════════════ */}
        {isMCQ && mcqSubmitted && evaluation && (
          <div className="glass-card feedback-card" style={{ animation: 'slideUp 0.35s ease' }}>
            {/* Result Banner */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
              background: evaluation.isCorrect ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.10)',
              border: `1px solid ${evaluation.isCorrect ? 'rgba(52,211,153,0.3)' : 'rgba(239,68,68,0.3)'}`,
              marginBottom: '1.25rem',
            }}>
              {evaluation.isCorrect
                ? <CheckCircle size={28} color="var(--color-accent-green)" />
                : <AlertCircle size={28} color="var(--color-accent-rose)" />}
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: evaluation.isCorrect ? 'var(--color-accent-green)' : 'var(--color-accent-rose)' }}>
                  {evaluation.isCorrect ? '✅ Correct!' : '❌ Incorrect'}
                </div>
                {!evaluation.isCorrect && (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    You selected <strong>{evaluation.selectedOption}</strong>. Correct: <strong>{evaluation.correctAnswer}</strong>
                  </div>
                )}
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: evaluation.isCorrect ? 'var(--color-accent-green)' : 'var(--color-accent-rose)' }}>
                  {evaluation.score}/10
                </div>
              </div>
            </div>

            {/* All options colour-coded */}
            {mcqData?.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                {Object.entries(mcqData.options).map(([key, value]) => {
                  const isCorrectOpt  = key === mcqData.correctAnswer;
                  const isSelectedOpt = key === evaluation.selectedOption;
                  let bg = 'rgba(255,255,255,0.03)', border = 'var(--glass-border)', textColor = 'var(--text-secondary)';
                  if (isCorrectOpt)            { bg = 'rgba(52,211,153,0.1)';  border = 'rgba(52,211,153,0.4)';  textColor = 'var(--color-accent-green)'; }
                  else if (isSelectedOpt)      { bg = 'rgba(239,68,68,0.08)';  border = 'rgba(239,68,68,0.3)';   textColor = 'var(--color-accent-rose)'; }
                  return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: bg, border: `1px solid ${border}` }}>
                      <span style={{ fontWeight: 700, fontSize: '0.875rem', color: textColor, minWidth: 20 }}>{key}.</span>
                      <span style={{ fontSize: '0.9rem', color: textColor, flex: 1 }}>{value}</span>
                      {isCorrectOpt  && <CheckCircle size={16} color="var(--color-accent-green)" />}
                      {isSelectedOpt && !isCorrectOpt && <AlertCircle size={16} color="var(--color-accent-rose)" />}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Explanation */}
            {evaluation.explanation && (
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.625rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-accent-secondary)' }}>
                  <Lightbulb size={14} /> Explanation
                </div>
                <div className="better-answer-box">{evaluation.explanation}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <NextButton currentQ={currentQ} saving={saving} onClick={handleNext} />
            </div>
          </div>
        )}

        {/* ════════════════════════════
            TEXT evaluating indicator
            ════════════════════════════ */}
        {!isMCQ && phase === 'evaluating' && (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
            <div className="spinner spinner-lg" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Evaluating your answer…</p>
          </div>
        )}

        {/* ════════════════════════════
            TEXT FEEDBACK
            ════════════════════════════ */}
        {!isMCQ && showFeedback && evaluation && (
          <div className="glass-card feedback-card">
            <div className="feedback-score">
              <div className="score-number">{evaluation.score}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-muted)' }}>out of 10</div>
                <ScoreBar score={evaluation.score} />
              </div>
            </div>

            <div className="divider" style={{ margin: '1rem 0' }} />

            {evaluation.strengths?.length > 0 && (
              <div className="feedback-section">
                <div className="feedback-label text-green" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={14} /> Strengths
                </div>
                <ul className="feedback-list" style={{ marginTop: '0.5rem' }}>
                  {evaluation.strengths.map((s, i) => (
                    <li key={i}><CheckCircle size={13} color="var(--color-accent-green)" />{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.weaknesses?.length > 0 && (
              <div className="feedback-section" style={{ marginTop: '1rem' }}>
                <div className="feedback-label text-rose" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingDown size={14} /> Areas to Improve
                </div>
                <ul className="feedback-list" style={{ marginTop: '0.5rem' }}>
                  {evaluation.weaknesses.map((w, i) => (
                    <li key={i}><AlertCircle size={13} color="var(--color-accent-rose)" />{w}</li>
                  ))}
                </ul>
              </div>
            )}

            {evaluation.betterAnswer && (
              <div style={{ marginTop: '1.25rem' }}>
                <div className="feedback-label text-accent" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.625rem' }}>
                  <Lightbulb size={14} /> Model Answer
                </div>
                <div className="better-answer-box">{evaluation.betterAnswer}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-xl)' }}>
              <NextButton currentQ={currentQ} saving={saving} onClick={handleNext} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Shared Next/Finish button ─────────────────────────────────────────────
function NextButton({ currentQ, saving, onClick }) {
  return (
    <button
      className="btn btn-primary btn-lg"
      onClick={onClick}
      id="next-question-btn"
      disabled={saving}
    >
      {saving ? (
        <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Saving…</>
      ) : currentQ === TOTAL_QUESTIONS - 1 ? (
        <>View Final Report <CheckCircle size={18} /></>
      ) : (
        <>Next Question <ChevronRight size={18} /></>
      )}
    </button>
  );
}

// ── Mini score bar ────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const pct   = (score / 10) * 100;
  const color = score >= 8 ? 'var(--color-accent-green)'
              : score >= 5 ? 'var(--color-accent-amber)'
              : 'var(--color-accent-rose)';
  return (
    <div style={{ marginTop: '0.5rem', width: '180px' }}>
      <div style={{ height: 6, background: '#E2E8F0', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '999px', transition: 'width 0.8s ease' }} />
      </div>
    </div>
  );
}
