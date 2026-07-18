// src/components/FirebaseRulesAlert.jsx
import { AlertCircle, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { FIRESTORE_RULES_TEXT } from '../services/firebaseRules';

export default function FirebaseRulesAlert() {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(FIRESTORE_RULES_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      background: '#FEF2F2',
      border: '2px dashed #EF4444',
      borderRadius: 'var(--radius-lg)',
      padding: '1.5rem',
      marginBottom: 'var(--spacing-xl)',
      animation: 'fadeIn 0.5s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <AlertCircle size={24} color="#EF4444" />
        <h3 style={{ margin: 0, color: '#991B1B', fontSize: '1.1rem', fontWeight: 800 }}>
          Firestore Permissions Denied (Missing Security Rules)
        </h3>
      </div>

      <p style={{ color: '#7F1D1D', fontSize: '0.9375rem', lineHeight: 1.6, marginBottom: '1rem' }}>
        The application is unable to read or write interview history because your Firestore Database security rules are blocking the request. 
        Please follow these steps to configure access:
      </p>

      <ol style={{ color: '#7F1D1D', fontSize: '0.9rem', paddingLeft: '1.25rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
        <li>Go to the <a href="https://console.firebase.google.com/" target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'underline' }}>Firebase Console</a>.</li>
        <li>Select your project <strong>ai-interview-a9b2a</strong>.</li>
        <li>Click <strong>Firestore Database</strong> under Build in the left sidebar.</li>
        <li>Select the <strong>Rules</strong> tab at the top.</li>
        <li>Replace the existing rules with the code block below.</li>
        <li>Click <strong>Publish</strong>.</li>
      </ol>

      <div style={{ position: 'relative' }}>
        <button
          onClick={handleCopy}
          style={{
            position: 'absolute',
            top: '0.75rem',
            right: '0.75rem',
            background: 'white',
            border: '1px solid #E2E8F0',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem 0.6rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#475569',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            zIndex: 10,
          }}
        >
          {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
          {copied ? 'Copied!' : 'Copy Rules'}
        </button>

        <pre style={{
          background: '#1E293B',
          color: '#F8FAFC',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.8125rem',
          overflowX: 'auto',
          margin: 0,
          fontFamily: 'monospace',
          lineHeight: 1.5,
          border: '1px solid #334155',
        }}>
          {FIRESTORE_RULES_TEXT}
        </pre>
      </div>
    </div>
  );
}
