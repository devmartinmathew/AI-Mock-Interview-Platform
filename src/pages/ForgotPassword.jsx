// src/pages/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email,   setEmail]   = useState('');
  const [error,   setError]   = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Check your inbox.');
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setError('No account found with this email.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="glass-card auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon"><Brain size={22} color="white" /></div>
          <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>InterviewAI</span>
        </div>

        <h1 className="auth-title text-center">Reset Password</h1>
        <p className="auth-subtitle text-center">
          Enter your email and we'll send you a reset link
        </p>

        {error   && <div className="error-msg"   style={{ marginBottom: '1rem' }}><AlertCircle  size={16} /> {error}</div>}
        {message && <div className="success-msg" style={{ marginBottom: '1rem' }}><CheckCircle  size={16} /> {message}</div>}

        {!message && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label" htmlFor="reset-email">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                }} />
                <input
                  id="reset-email"
                  type="email"
                  className="glass-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.75rem' }}
                />
              </div>
            </div>

            <button
              id="reset-submit-btn"
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ marginTop: '0.5rem' }}
            >
              {loading ? (
                <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Sending…</>
              ) : (
                <><Mail size={17} /> Send Reset Email</>
              )}
            </button>
          </form>
        )}

        <Link to="/login" className="btn btn-ghost btn-block" style={{ marginTop: '1.25rem' }}>
          <ArrowLeft size={16} /> Back to Login
        </Link>
      </div>
    </div>
  );
}
