// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';

import { isFirebaseConfigured } from './firebase/config';

// Pages
import Landing        from './pages/Landing';
import Login          from './pages/Login';
import Signup         from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard      from './pages/Dashboard';
import InterviewSetup from './pages/InterviewSetup';
import InterviewRoom  from './pages/InterviewRoom';
import Results        from './pages/Results';
import History        from './pages/History';
import Profile        from './pages/Profile';

function FirebaseErrorScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-bg-primary, #0F172A)', color: 'var(--text-primary, #F8FAFC)',
      padding: '2rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '600px', background: 'var(--color-bg-secondary, #1E293B)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--glass-border, #334155)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ marginBottom: '1rem', color: 'var(--color-accent-rose, #F87171)' }}>Firebase Not Configured</h1>
        <p style={{ marginBottom: '1rem', lineHeight: '1.6', color: 'var(--text-secondary, #CBD5E1)' }}>
          The application cannot start because the Firebase environment variables are missing.
        </p>
        <div style={{ textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', fontSize: '0.85rem', color: '#94A3B8' }}>
          <p style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>To fix this on Vercel:</p>
          <ol style={{ marginLeft: '1.5rem', lineHeight: '1.6' }}>
            <li>Go to your Vercel Project Settings</li>
            <li>Select Environment Variables</li>
            <li>Add all <code style={{ color: '#E2E8F0' }}>VITE_FIREBASE_*</code> variables from your local <code style={{ color: '#E2E8F0' }}>.env</code> file</li>
            <li>Redeploy the application</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  if (!isFirebaseConfigured) {
    return <FirebaseErrorScreen />;
  }

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
          {/* Public */}
          <Route path="/"               element={<Landing />} />
          <Route path="/login"          element={<Login />} />
          <Route path="/signup"         element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/setup"     element={<ProtectedRoute><InterviewSetup /></ProtectedRoute>} />
          <Route path="/interview" element={<ProtectedRoute><InterviewRoom /></ProtectedRoute>} />
          <Route path="/results/:id" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
