import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(username, password);
      if (!res.success) {
        setError(res.message || 'Invalid admin credentials');
      }
    } catch (err: any) {
      setError('Connection error. Please check backend server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Admin Login | Alokana Admin</title>
      </Head>
      <div style={styles.container}>
        <div style={styles.ambientGlow} />
        <div style={styles.card}>
          <div style={styles.header}>
            <div style={styles.badge}>
              <span style={styles.badgeDot} />
              ALOKANA ADMIN
            </div>
            <h1 style={styles.title}>Admin Access</h1>
            <p style={styles.subtitle}>Enter your credentials to manage Alokana</p>
          </div>

          {error && (
            <div style={styles.errorAlert}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label htmlFor="username" style={styles.label}>USERNAME</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={styles.input}
                autoComplete="username"
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label htmlFor="password" style={styles.label}>PASSWORD</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={styles.input}
                autoComplete="current-password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...styles.button,
                opacity: isSubmitting ? 0.75 : 1,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'AUTHENTICATING...' : 'SIGN IN'}
            </button>
          </form>

          <div style={styles.footerNote}>
            Protected System • Session expires on tab close
          </div>
        </div>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090b',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: '30%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(circle, rgba(246, 49, 37, 0.15) 0%, rgba(246, 49, 37, 0.03) 50%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: '#121214',
    borderRadius: '16px',
    padding: '40px 36px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(246, 49, 37, 0.12)',
    border: '1px solid rgba(246, 49, 37, 0.25)',
    position: 'relative',
    zIndex: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: '28px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 14px',
    backgroundColor: 'rgba(246, 49, 37, 0.12)',
    color: '#F63125',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '1.2px',
    marginBottom: '14px',
    border: '1px solid rgba(246, 49, 37, 0.35)',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#F63125',
    boxShadow: '0 0 8px #F63125',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#ffffff',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#a1a1aa',
    margin: 0,
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: 'rgba(246, 49, 37, 0.12)',
    color: '#ff8a80',
    border: '1px solid rgba(246, 49, 37, 0.4)',
    borderRadius: '8px',
    padding: '12px 14px',
    fontSize: '13px',
    marginBottom: '22px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#d4d4d8',
    letterSpacing: '0.8px',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    borderRadius: '8px',
    backgroundColor: '#1c1c1f',
    border: '1px solid #27272a',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  button: {
    width: '100%',
    padding: '14px',
    borderRadius: '8px',
    backgroundColor: '#F63125',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 700,
    letterSpacing: '1px',
    border: 'none',
    marginTop: '6px',
    boxShadow: '0 0 20px rgba(246, 49, 37, 0.4)',
    transition: 'all 0.2s ease',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: '11px',
    color: '#71717a',
    marginTop: '24px',
    letterSpacing: '0.3px',
  },
};
