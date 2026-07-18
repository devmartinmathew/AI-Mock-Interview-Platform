// src/components/LoadingSpinner.jsx
export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const isLg = size === 'lg';
  return (
    <div className="spinner-container">
      <div className={`spinner ${isLg ? 'spinner-lg' : ''}`} />
      {text && <p className="text-secondary" style={{ fontSize: isLg ? '1rem' : '0.875rem' }}>{text}</p>}
    </div>
  );
}

export function PageLoader({ text }) {
  return (
    <div className="page-loading">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}
