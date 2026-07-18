// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Mail, Lock, AlertCircle, LogIn } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  }

  function friendlyError(code) {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please try again.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a moment.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      default:
        return 'Login failed. Please check your credentials.';
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

        <h1 className="auth-title text-center">Welcome Back</h1>
        <p className="auth-subtitle text-center">Sign in to continue your interview practice</p>

        {error && (
          <div className="error-msg" style={{ marginBottom: '1rem' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                id="login-email"
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

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="login-password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.8125rem', color: 'var(--color-accent-secondary)' }}>
                Forgot password?
              </Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{
                position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                id="login-password"
                type="password"
                className="glass-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing in…</>
            ) : (
              <><LogIn size={17} /> Sign In</>
            )}
          </button>
        </form>

        <div className="auth-divider" style={{ margin: '1.5rem 0 0' }}>
          <span>Don't have an account?</span>
        </div>
        <Link to="/signup" className="btn btn-ghost btn-block" style={{ marginTop: '0.75rem' }}>
          Create Free Account
        </Link>
      </div>
    </div>
  );
}
