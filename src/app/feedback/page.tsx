'use client';

import { useState, useEffect, useCallback } from 'react';

interface FeedbackEntry {
  id: string;
  page: number;
  text: string;
  author: string;
  ts: string;
  deckUrl: string;
}

export default function FeedbackPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [deckUrl, setDeckUrl] = useState('');
  const [loadedUrl, setLoadedUrl] = useState('');
  const [page, setPage] = useState(1);
  const [author, setAuthor] = useState('');
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);

  // Check if already authed on mount
  useEffect(() => {
    fetch('/api/feedback?deck=__check__')
      .then(r => { setAuthed(r.status !== 401); setChecking(false); })
      .catch(() => setChecking(false));
  }, []);

  // Load saved author name
  useEffect(() => {
    const saved = localStorage.getItem('feedback_author');
    if (saved) setAuthor(saved);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/feedback/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      setAuthed(true);
    } else {
      setAuthError('Wrong password');
    }
  };

  const loadDeck = useCallback(async () => {
    if (!deckUrl.trim()) return;
    setLoadedUrl(deckUrl.trim());
    // Fetch existing feedback
    const res = await fetch(`/api/feedback?deck=${encodeURIComponent(deckUrl.trim())}`);
    if (res.ok) {
      setFeedback(await res.json());
    }
  }, [deckUrl]);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !loadedUrl) return;
    setSubmitting(true);
    localStorage.setItem('feedback_author', author);

    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckUrl: loadedUrl, page, text, author }),
    });

    if (res.ok) {
      const entry = await res.json();
      setFeedback(prev => [...prev, entry]);
      setText('');
    }
    setSubmitting(false);
  };

  const deleteFeedback = async (id: string) => {
    setFeedback(prev => prev.filter(f => f.id !== id));
  };

  if (checking) {
    return <div style={styles.container}><p style={{ color: '#94a3b8' }}>Loading...</p></div>;
  }

  // Password gate
  if (!authed) {
    return (
      <div style={styles.container}>
        <div style={styles.authBox}>
          <h1 style={styles.title}>Slide Feedback</h1>
          <p style={styles.subtitle}>Enter the password to continue</p>
          <form onSubmit={handleAuth} style={styles.authForm}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              style={styles.input}
              autoFocus
            />
            <button type="submit" style={styles.btnPrimary}>Enter</button>
            {authError && <p style={styles.error}>{authError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {!loadedUrl && (
        <>
          <h1 style={styles.title}>Slide Feedback</h1>
          <p style={styles.subtitle}>Paste a slide deck URL to review and submit feedback</p>
        </>
      )}

      {/* URL bar — compact when deck is loaded */}
      <div style={styles.urlBar}>
        <input
          type="text"
          value={deckUrl}
          onChange={e => setDeckUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadDeck()}
          placeholder="Paste slide deck URL..."
          style={{ ...styles.input, flex: 1, fontSize: '0.85rem', padding: '0.4rem 0.6rem' }}
        />
        <button onClick={loadDeck} style={{ ...styles.btnPrimary, padding: '0.4rem 1rem', fontSize: '0.85rem' }}>Load</button>
      </div>

      {loadedUrl && (
        <div style={styles.mainLayout}>
          {/* Iframe — fills nearly all vertical space */}
          <div style={styles.iframePanel}>
            <iframe
              src={loadedUrl}
              style={styles.iframe}
              title="Slide deck"
              allow="fullscreen"
            />
          </div>

          {/* Feedback panel — narrow sidebar */}
          <div style={styles.feedbackPanel}>
            <form onSubmit={submitFeedback}>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 70 }}>
                  <label style={styles.label}>Page #</label>
                  <input
                    type="number"
                    min={1}
                    value={page}
                    onChange={e => setPage(Number(e.target.value))}
                    style={{ ...styles.input, fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Name</label>
                  <input
                    type="text"
                    value={author}
                    onChange={e => setAuthor(e.target.value)}
                    placeholder="Optional"
                    style={{ ...styles.input, fontSize: '0.85rem', padding: '0.35rem 0.5rem' }}
                  />
                </div>
              </div>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Describe the issue or suggestion..."
                rows={3}
                style={{ ...styles.input, resize: 'vertical' as const, fontSize: '0.85rem', padding: '0.35rem 0.5rem', marginBottom: '0.5rem' }}
              />
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                style={{
                  ...styles.btnPrimary,
                  opacity: submitting || !text.trim() ? 0.5 : 1,
                  width: '100%',
                  padding: '0.4rem',
                  fontSize: '0.85rem',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>

            {/* Existing feedback */}
            <div style={styles.historySection}>
              <h4 style={styles.historyTitle}>
                Feedback ({feedback.length})
                {feedback.length > 0 && (
                  <a href="/api/feedback/export" style={styles.exportLink} download>Export</a>
                )}
              </h4>
              {feedback.length === 0 && (
                <p style={{ color: '#64748b', fontSize: '0.8rem' }}>No feedback yet.</p>
              )}
              {[...feedback].reverse().map(f => (
                <div key={f.id} style={styles.feedbackCard}>
                  <div style={styles.feedbackHeader}>
                    <span style={styles.pageBadge}>P{f.page}</span>
                    <span style={styles.feedbackAuthor}>{f.author || 'Anon'}</span>
                    <span style={styles.feedbackTime}>
                      {new Date(f.ts).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={styles.feedbackText}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    padding: '0.5rem 0.75rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  title: {
    fontSize: '1.8rem',
    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center' as const,
    marginTop: '2rem',
    marginBottom: '0.25rem',
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#94a3b8',
    marginBottom: '1rem',
    fontSize: '0.9rem',
  },
  authBox: {
    maxWidth: 400,
    margin: '100px auto 0',
    textAlign: 'center' as const,
  },
  authForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginTop: '1rem',
  },
  urlBar: {
    display: 'flex',
    gap: '0.4rem',
    marginBottom: '0.5rem',
  },
  input: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 6,
    padding: '0.4rem 0.6rem',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
  },
  btnPrimary: {
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '0.4rem 1rem',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    color: '#f87171',
    fontSize: '0.9rem',
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 260px',
    gap: '0.5rem',
    height: 'calc(100vh - 5.5rem)',
  },
  iframePanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    minHeight: 0,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: '1px solid #334155',
    borderRadius: 8,
    background: '#1e293b',
  },
  feedbackPanel: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '0.75rem',
    overflowY: 'auto' as const,
    minHeight: 0,
  },
  label: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.75rem',
    marginBottom: '0.15rem',
  },
  historySection: {
    marginTop: '0.75rem',
    borderTop: '1px solid #334155',
    paddingTop: '0.5rem',
  },
  historyTitle: {
    color: '#94a3b8',
    fontSize: '0.8rem',
    marginBottom: '0.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportLink: {
    color: '#a78bfa',
    fontSize: '0.75rem',
    textDecoration: 'none',
  },
  feedbackCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 6,
    padding: '0.5rem',
    marginBottom: '0.4rem',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.25rem',
    flexWrap: 'wrap' as const,
  },
  pageBadge: {
    background: '#6366f1',
    color: 'white',
    fontSize: '0.7rem',
    padding: '0.1rem 0.4rem',
    borderRadius: 10,
    fontWeight: 600,
  },
  feedbackAuthor: {
    color: '#93c5fd',
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  feedbackTime: {
    color: '#475569',
    fontSize: '0.7rem',
    marginLeft: 'auto',
  },
  feedbackText: {
    color: '#cbd5e1',
    fontSize: '0.8rem',
    lineHeight: 1.4,
    margin: 0,
  },
};
