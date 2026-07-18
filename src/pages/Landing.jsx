// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
  Brain, Zap, BarChart2, Clock, Shield, Star,
  ArrowRight, CheckCircle, ChevronRight, Play
} from 'lucide-react';

const FEATURES = [
  {
    icon: <Brain size={26} />,
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(37,99,235,0.02))',
    title: 'AI-Powered Questions',
    desc: 'Google Gemini generates tailored interview questions based on your role and difficulty level for a realistic experience.',
  },
  {
    icon: <Zap size={26} />,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.02))',
    title: 'Real-Time Evaluation',
    desc: 'Get instant AI feedback on every answer — score, strengths, weaknesses, and a model answer to learn from.',
  },
  {
    icon: <BarChart2 size={26} />,
    color: '#1D4ED8',
    gradient: 'linear-gradient(135deg, rgba(29,78,216,0.1), rgba(29,78,216,0.02))',
    title: 'Detailed Analytics',
    desc: 'Track technical, communication, and confidence scores. Understand where you excel and what to improve.',
  },
  {
    icon: <Clock size={26} />,
    color: '#60A5FA',
    gradient: 'linear-gradient(135deg, rgba(96,165,250,0.1), rgba(96,165,250,0.02))',
    title: 'Timed Practice',
    desc: 'Each question has a 60-second timer to simulate real interview pressure and sharpen your response speed.',
  },
  {
    icon: <Shield size={26} />,
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(37,99,235,0.02))',
    title: 'Multiple Roles',
    desc: 'Prepare for Frontend, Backend, Java, Python, MERN Stack, or HR interviews — all in one platform.',
  },
  {
    icon: <Star size={26} />,
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(59,130,246,0.02))',
    title: 'Hiring Recommendation',
    desc: "Get a hiring recommendation (Strong Yes to No) so you know exactly where you stand before the real thing.",
  },
];

const TESTIMONIALS = [
  {
    text: '"InterviewAI completely transformed my preparation. I got detailed feedback on every answer and knew exactly what to fix. Landed my dream job at a top-tier startup!"',
    name: 'Arjun Sharma',
    role: 'Frontend Developer @ Razorpay',
    rating: 5,
    initials: 'AS',
    color: '#2563EB',
  },
  {
    text: '"The Gemini-powered questions were shockingly similar to my actual interview. The timed format made me much calmer under real pressure. Highly recommend!"',
    name: 'Priya Nair',
    role: 'Backend Developer @ Swiggy',
    rating: 5,
    initials: 'PN',
    color: '#3B82F6',
  },
  {
    text: '"From HR to technical rounds, this platform covered it all. The hiring recommendation feature is genius — I knew I was ready before I even walked in."',
    name: 'Ravi Menon',
    role: 'Full Stack Developer @ Zepto',
    rating: 5,
    initials: 'RM',
    color: '#60A5FA',
  },
];

const ROLES = [
  { label: 'Frontend Developer', icon: '🎨' },
  { label: 'Backend Developer',  icon: '⚙️' },
  { label: 'Java Developer',     icon: '☕' },
  { label: 'Python Developer',   icon: '🐍' },
  { label: 'MERN Stack',         icon: '🌐' },
  { label: 'HR Interview',       icon: '🤝' },
];

export default function Landing() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <Navbar />

      {/* ── Hero ───────────────────────────────────────── */}
      <section className="landing-hero">
        <div className="landing-hero-bg" />
        <div className="hero-orbs">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">
            <Zap size={13} />
            Powered by Google Gemini AI
          </div>

          <h1 className="hero-title">
            Master Every{' '}
            <span className="gradient-text">Interview</span>
            {' '}with AI
          </h1>

          <p className="hero-desc">
            Practice realistic technical and HR interviews. Get instant AI-powered feedback,
            detailed scores, and hiring recommendations — all in one premium platform.
          </p>

          <div className="hero-cta">
            <Link to="/signup" className="btn btn-primary btn-lg" id="hero-get-started-btn">
              Start Practicing Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg" id="hero-login-btn">
              <Play size={16} /> Watch Demo
            </Link>
          </div>

          <div className="hero-stats">
            {[
              { value: '10K+', label: 'Interviews Done' },
              { value: '95%',  label: 'Success Rate' },
              { value: '6',    label: 'Role Categories' },
              { value: '4.9★', label: 'User Rating' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Roles Banner ───────────────────────────────── */}
      <section style={{
        padding: '1.5rem 0',
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--glass-border)',
        borderBottom: '1px solid var(--glass-border)',
        overflow: 'hidden',
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}>
            {ROLES.map((r) => (
              <div key={r.label} style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: 'var(--text-secondary)', fontSize: '0.9375rem', fontWeight: 500,
              }}>
                <span>{r.icon}</span> {r.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────── */}
      <section className="features-section">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <p className="section-label">Why InterviewAI</p>
            <h2>Everything You Need to <span className="gradient-text">Get Hired</span></h2>
            <p style={{ maxWidth: '560px', margin: '1rem auto 0' }}>
              We combine cutting-edge AI with battle-tested interview strategies to give you
              the most realistic, actionable mock interview experience available.
            </p>
          </div>

          <div className="grid-3 stagger-children">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card feature-card animate-slide-up">
                <div
                  className="feature-icon"
                  style={{ background: f.gradient, color: f.color }}
                >
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9375rem' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────── */}
      <section style={{ padding: 'var(--spacing-3xl) 0', background: 'var(--color-bg-primary)' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <p className="section-label">Simple Process</p>
            <h2>How It <span className="gradient-text">Works</span></h2>
          </div>

          <div className="grid-3">
            {[
              { step: '01', title: 'Choose Role & Difficulty', desc: 'Select your target position and difficulty level — Easy, Medium, or Hard.', icon: '🎯' },
              { step: '02', title: 'Answer AI Questions', desc: '5 AI-generated questions, one at a time, with a 60-second timer per question.', icon: '💬' },
              { step: '03', title: 'Get Your Report', desc: 'Receive detailed scores, strengths, weaknesses, and a hiring recommendation.', icon: '📊' },
            ].map((item) => (
              <div key={item.step} className="glass-card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
                <div style={{
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto var(--spacing-md)',
                  fontSize: '1.5rem',
                }}>
                  {item.icon}
                </div>
                <div style={{
                  fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em',
                  color: 'var(--color-accent-secondary)', marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                }}>
                  Step {item.step}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.9375rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────── */}
      <section className="testimonials-section">
        <div className="container">
          <div className="text-center" style={{ marginBottom: 'var(--spacing-2xl)' }}>
            <p className="section-label">Success Stories</p>
            <h2>Loved by <span className="gradient-text">Job Seekers</span></h2>
          </div>

          <div className="grid-3 stagger-children">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass-card testimonial-card animate-slide-up">
                <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                <p className="testimonial-text">{t.text}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar" style={{ background: `linear-gradient(135deg, ${t.color}, ${t.color}88)` }}>
                    {t.initials}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────── */}
      <section style={{
        padding: 'var(--spacing-3xl) 0',
        background: 'var(--color-bg-secondary)',
        borderTop: '1px solid var(--glass-border)',
      }}>
        <div className="container text-center">
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>
            Ready to <span className="gradient-text">Land Your Dream Job?</span>
          </h2>
          <p style={{ maxWidth: '480px', margin: '0 auto var(--spacing-2xl)' }}>
            Join thousands of developers who've used InterviewAI to prepare and succeed.
            Start your first mock interview in under 60 seconds.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/signup" className="btn btn-primary btn-lg" id="cta-signup-btn">
              Get Started — It's Free <ChevronRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost btn-lg">
              Sign In
            </Link>
          </div>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap'
          }}>
            {['No credit card required', 'Instant access', 'AI-powered feedback'].map(item => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: '0.375rem',
                fontSize: '0.875rem', color: 'var(--text-secondary)',
              }}>
                <CheckCircle size={14} color="var(--color-accent-green)" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div className="navbar-logo-icon" style={{ width: 28, height: 28 }}>
              <Brain size={16} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>InterviewAI</span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} InterviewAI. Built with Google Gemini &amp; Firebase.
          </p>
        </div>
      </footer>
    </div>
  );
}
