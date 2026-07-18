// src/components/Navbar.jsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Brain, LayoutDashboard, History, User, LogOut, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'navbar-link active' : 'navbar-link';

  async function handleLogout() {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Logout failed', err);
    }
  }

  const initials = currentUser?.displayName
    ? currentUser.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : currentUser?.email?.[0]?.toUpperCase() ?? 'U';

  const themeToggleBtn = (
    <button
      onClick={toggleTheme}
      style={{
        background: 'transparent',
        border: '1px solid var(--glass-border)',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-primary)',
        transition: 'all var(--transition-fast)',
        outline: 'none',
      }}
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      id="navbar-theme-toggle"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );

  return (
    <nav className="navbar">
      {/* Logo */}
      <Link to={currentUser ? '/dashboard' : '/'} className="navbar-logo">
        <div className="navbar-logo-icon">
          <Brain size={20} color="white" />
        </div>
        <span>InterviewAI</span>
      </Link>

      {/* Nav links — authenticated */}
      {currentUser ? (
        <>
          <ul className="navbar-nav">
            <li><Link to="/dashboard" className={isActive('/dashboard')}><LayoutDashboard size={15} style={{display:'inline',marginRight:4}} />Dashboard</Link></li>
            <li><Link to="/history"   className={isActive('/history')}><History size={15} style={{display:'inline',marginRight:4}} />History</Link></li>
            <li><Link to="/profile"   className={isActive('/profile')}><User size={15} style={{display:'inline',marginRight:4}} />Profile</Link></li>
          </ul>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {themeToggleBtn}
            <Link to="/profile">
              <div className="navbar-avatar">{initials}</div>
            </Link>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="navbar-logout-btn">
              <LogOut size={15} /> Logout
            </button>
          </div>
        </>
      ) : (
        /* Public nav */
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {themeToggleBtn}
          <Link to="/login"  className="btn btn-ghost btn-sm">Log In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      )}
    </nav>
  );
}
