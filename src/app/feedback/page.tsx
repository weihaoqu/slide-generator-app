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
      <h1 style={styles.title}>Slide Feedback Collector</h1>
      <p style={styles.subtitle}>Load a slide deck, navigate to the page with an issue, and submit your feedback</p>

      {/* URL input */}
      <div style={styles.urlBar}>
        <input
          type="text"
          value={deckUrl}
          onChange={e => setDeckUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadDeck()}
          placeholder="Paste slide deck URL (e.g., https://weihaoqu.github.io/course-slides/bf422/...)"
          style={{ ...styles.input, flex: 1 }}
        />
        <button onClick={loadDeck} style={styles.btnPrimary}>Load</button>
      </div>

      {loadedUrl && (
        <div style={styles.mainLayout}>
          {/* Iframe */}
          <div style={styles.iframePanel}>
            <iframe
              src={loadedUrl}
              style={styles.iframe}
              title="Slide deck"
              allow="fullscreen"
            />
            <p style={styles.iframeHint}>
              Use arrow keys inside the deck to navigate. Note the page number shown at the bottom.
            </p>
          </div>

          {/* Feedback panel */}
          <div style={styles.feedbackPanel}>
            <h3 style={styles.panelTitle}>Submit Feedback</h3>
            <form onSubmit={submitFeedback}>
              <div style={styles.formRow}>
                <label style={styles.label}>Page #</label>
                <input
                  type="number"
                  min={1}
                  value={page}
                  onChange={e => setPage(Number(e.target.value))}
                  style={{ ...styles.input, width: 80 }}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Your name</label>
                <input
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Optional"
                  style={styles.input}
                />
              </div>
              <div style={styles.formRow}>
                <label style={styles.label}>Feedback</label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Describe the issue or suggestion..."
                  rows={4}
                  style={{ ...styles.input, resize: 'vertical' as const }}
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !text.trim()}
                style={{
                  ...styles.btnPrimary,
                  opacity: submitting || !text.trim() ? 0.5 : 1,
                  width: '100%',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>

            {/* Existing feedback */}
            <div style={styles.historySection}>
              <h4 style={styles.historyTitle}>
                Feedback ({feedback.length})
                {feedback.length > 0 && (
                  <a
                    href="/api/feedback/export"
                    style={styles.exportLink}
                    download
                  >
                    Export all
                  </a>
                )}
              </h4>
              {feedback.length === 0 && (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No feedback yet for this deck.</p>
              )}
              {[...feedback].reverse().map(f => (
                <div key={f.id} style={styles.feedbackCard}>
                  <div style={styles.feedbackHeader}>
                    <span style={styles.pageBadge}>Page {f.page}</span>
                    <span style={styles.feedbackAuthor}>{f.author || 'Anonymous'}</span>
                    <span style={styles.feedbackTime}>
                      {new Date(f.ts).toLocaleDateString()} {new Date(f.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
    padding: '2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  title: {
    fontSize: '2rem',
    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center' as const,
    marginBottom: '0.25rem',
  },
  subtitle: {
    textAlign: 'center' as const,
    color: '#94a3b8',
    marginBottom: '1.5rem',
    fontSize: '1rem',
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
    gap: '0.5rem',
    maxWidth: 900,
    margin: '0 auto 1.5rem',
  },
  input: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '0.6rem 0.75rem',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
  },
  btnPrimary: {
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '0.6rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  error: {
    color: '#f87171',
    fontSize: '0.9rem',
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: '1.5rem',
    maxWidth: 1400,
    margin: '0 auto',
    minHeight: '70vh',
  },
  iframePanel: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  iframe: {
    width: '100%',
    flex: 1,
    minHeight: '70vh',
    border: '1px solid #334155',
    borderRadius: 12,
    background: '#1e293b',
  },
  iframeHint: {
    color: '#64748b',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    textAlign: 'center' as const,
  },
  feedbackPanel: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 12,
    padding: '1.25rem',
    overflowY: 'auto' as const,
    maxHeight: '80vh',
  },
  panelTitle: {
    color: '#93c5fd',
    fontSize: '1.1rem',
    marginBottom: '1rem',
  },
  formRow: {
    marginBottom: '0.75rem',
  },
  label: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.85rem',
    marginBottom: '0.25rem',
  },
  historySection: {
    marginTop: '1.5rem',
    borderTop: '1px solid #334155',
    paddingTop: '1rem',
  },
  historyTitle: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginBottom: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportLink: {
    color: '#a78bfa',
    fontSize: '0.8rem',
    textDecoration: 'none',
  },
  feedbackCard: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '0.75rem',
    marginBottom: '0.5rem',
  },
  feedbackHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.4rem',
    flexWrap: 'wrap' as const,
  },
  pageBadge: {
    background: '#6366f1',
    color: 'white',
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: 12,
    fontWeight: 600,
  },
  feedbackAuthor: {
    color: '#93c5fd',
    fontSize: '0.8rem',
    fontWeight: 500,
  },
  feedbackTime: {
    color: '#475569',
    fontSize: '0.75rem',
    marginLeft: 'auto',
  },
  feedbackText: {
    color: '#cbd5e1',
    fontSize: '0.88rem',
    lineHeight: 1.5,
    margin: 0,
  },
};
