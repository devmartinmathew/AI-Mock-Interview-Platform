// src/contexts/ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // 1. Check local storage
    const saved = localStorage.getItem('app-theme');
    if (saved) return saved;

    // 2. Fall back to system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  });

  const [toast, setToast] = useState(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      // Trigger toast notification
      setToast(next === 'dark' ? 'Dark Mode Enabled' : 'Light Mode Enabled');
      return next;
    });
  }

  // Clear toast after 2.5s
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const value = {
    theme,
    toggleTheme,
    toast,
    setToast,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}

      {/* Render Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          background: theme === 'dark' ? '#1E293B' : '#FFFFFF',
          color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
          border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}`,
          borderRadius: '8px',
          padding: '0.75rem 1.25rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          animation: 'slideUp 0.3s ease-out forwards',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
          {toast}
        </div>
      )}
    </ThemeContext.Provider>
  );
}
export default ThemeContext;
