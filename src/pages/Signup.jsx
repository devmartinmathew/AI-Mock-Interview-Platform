// src/pages/Signup.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Mail, Lock, User, AlertCircle, UserPlus } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      return setError('Passwords do not match.');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await signup(email, password, name.trim() || null);
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  function friendlyError(code) {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters.';
      default:
        return 'Sign up failed. Please try again.';
    }
  }

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><Brain size={22} color="white" /></div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>InterviewAI</span>
        </div>

        <h1 className="auth-title text-center">Create Your Account</h1>
        <p className="auth-subtitle text-center">Start practicing interviews with AI today</p>

        {error && (
          <div className="error-msg" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                id="signup-name"
                type="text"
                className="glass-input"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                id="signup-email"
                type="email"
                className="glass-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                id="signup-password"
                type="password"
                className="glass-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-confirm">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                id="signup-confirm"
                type="password"
                className="glass-input"
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <button
            id="signup-submit-btn"
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating account…</>
            ) : (
              <><UserPlus size={17} /> Create Account</>
            )}
          </button>
        </form>

        <div className="auth-divider" style={{ margin: '1.5rem 0 0' }}>
          <span>Already have an account?</span>
        </div>
        <Link to="/login" className="btn btn-ghost btn-block" style={{ marginTop: '0.75rem' }}>
          Sign In Instead
        </Link>
      </div>
    </div>
  );
}
