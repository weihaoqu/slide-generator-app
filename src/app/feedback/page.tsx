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
  const [submitError, setSubmitError] = useState('');
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [panelOpen, setPanelOpen] = useState(true);

  // Break out of parent layout constraints
  useEffect(() => {
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const header = document.querySelector('header');
    if (main) {
      main.style.maxWidth = 'none';
      main.style.margin = '0';
      main.style.padding = '0';
      main.style.flex = '1';
      main.style.display = 'flex';
      main.style.flexDirection = 'column';
    }
    if (footer) footer.style.display = 'none';
    if (header) header.style.display = 'none';
    return () => {
      if (main) { main.style.maxWidth = ''; main.style.margin = ''; main.style.padding = ''; main.style.flex = ''; main.style.display = ''; main.style.flexDirection = ''; }
      if (footer) footer.style.display = '';
      if (header) header.style.display = '';
    };
  }, []);

  // Listen for slide navigation from iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'slideChange' && typeof e.data.page === 'number') {
        setPage(e.data.page);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  useEffect(() => {
    fetch('/api/feedback?deck=__check__')
      .then(r => { setAuthed(r.status !== 401); setChecking(false); })
      .catch(() => setChecking(false));
  }, []);

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
    const res = await fetch(`/api/feedback?deck=${encodeURIComponent(deckUrl.trim())}`);
    if (res.ok) {
      setFeedback(await res.json());
    }
  }, [deckUrl]);

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !loadedUrl) return;
    setSubmitting(true);
    setSubmitError('');
    localStorage.setItem('feedback_author', author);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckUrl: loadedUrl, page, text, author }),
      });

      if (res.ok) {
        const entry = await res.json();
        setFeedback(prev => [...prev, entry]);
        setText('');
      } else {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        setSubmitError(err.error || `Error ${res.status}`);
      }
    } catch {
      setSubmitError('Network error — check connection');
    }
    setSubmitting(false);
  };

  if (checking) {
    return <div style={S.page}><p style={{ color: '#94a3b8' }}>Loading...</p></div>;
  }

  if (!authed) {
    return (
      <div style={S.page}>
        <div style={S.authBox}>
          <h1 style={S.authTitle}>Slide Feedback</h1>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Enter the password to continue</p>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.75rem' }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" style={S.input} autoFocus />
            <button type="submit" style={S.btn}>Enter</button>
            {authError && <p style={{ color: '#f87171', fontSize: '0.9rem' }}>{authError}</p>}
          </form>
        </div>
      </div>
    );
  }

  // Main view — full-screen iframe with overlay panel
  return (
    <div style={S.page}>
      {/* Top bar: URL input */}
      <div style={S.topBar}>
        <input type="text" value={deckUrl} onChange={e => setDeckUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadDeck()}
          placeholder="Paste slide deck URL..."
          style={{ ...S.input, flex: 1 }} />
        <button onClick={loadDeck} style={S.btn}>Load</button>
        {loadedUrl && (
          <button onClick={() => setPanelOpen(!panelOpen)}
            style={{ ...S.btn, background: panelOpen ? '#475569' : '#6366f1', padding: '0.4rem 0.75rem' }}>
            {panelOpen ? 'Hide' : 'Feedback'}
          </button>
        )}
      </div>

      {!loadedUrl && (
        <div style={{ textAlign: 'center' as const, marginTop: '4rem' }}>
          <h1 style={S.authTitle}>Slide Feedback</h1>
          <p style={{ color: '#94a3b8' }}>Paste a slide deck URL above and click Load</p>
        </div>
      )}

      {loadedUrl && (
        <div style={S.iframeWrap}>
          <iframe src={loadedUrl} style={S.iframe} title="Slide deck" allow="fullscreen" />

          {/* Feedback drawer — slides over from right */}
          {panelOpen && (
            <div style={S.drawer}>
              <form onSubmit={submitFeedback}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <div style={{ width: 60 }}>
                    <label style={S.label}>Page</label>
                    <input type="number" min={1} value={page}
                      onChange={e => setPage(Number(e.target.value))}
                      style={{ ...S.input, fontSize: '0.8rem', padding: '0.3rem 0.4rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={S.label}>Name</label>
                    <input type="text" value={author} onChange={e => setAuthor(e.target.value)}
                      placeholder="Optional"
                      style={{ ...S.input, fontSize: '0.8rem', padding: '0.3rem 0.4rem' }} />
                  </div>
                </div>
                <textarea value={text} onChange={e => setText(e.target.value)}
                  placeholder="Describe the issue..."
                  rows={3}
                  style={{ ...S.input, resize: 'vertical' as const, fontSize: '0.8rem', padding: '0.3rem 0.4rem', marginBottom: '0.4rem' }} />
                <button type="submit" disabled={submitting || !text.trim()}
                  style={{ ...S.btn, width: '100%', opacity: submitting || !text.trim() ? 0.5 : 1, padding: '0.35rem', fontSize: '0.8rem' }}>
                  {submitting ? 'Sending...' : 'Submit'}
                </button>
                {submitError && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: '0.3rem' }}>{submitError}</p>}
              </form>

              <div style={{ marginTop: '0.6rem', borderTop: '1px solid #334155', paddingTop: '0.4rem' }}>
                <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '0.4rem' }}>
                  Feedback ({feedback.length})
                </div>
                {feedback.length === 0 && (
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>No feedback yet.</p>
                )}
                {[...feedback].reverse().map(f => (
                  <div key={f.id} style={S.card}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.2rem' }}>
                      <span style={S.badge}>P{f.page}</span>
                      <span style={{ color: '#93c5fd', fontSize: '0.7rem' }}>{f.author || 'Anon'}</span>
                      <span style={{ color: '#475569', fontSize: '0.65rem', marginLeft: 'auto' }}>
                        {new Date(f.ts).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '0.75rem', lineHeight: 1.3, margin: 0 }}>{f.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    height: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    overflow: 'hidden',
  },
  authTitle: {
    fontSize: '1.8rem',
    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center' as const,
    marginBottom: '0.25rem',
  },
  authBox: {
    maxWidth: 400,
    margin: '100px auto 0',
    textAlign: 'center' as const,
  },
  topBar: {
    display: 'flex',
    gap: '0.4rem',
    padding: '0.4rem 0.5rem',
    background: '#1e293b',
    borderBottom: '1px solid #334155',
    flexShrink: 0,
  },
  input: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 5,
    padding: '0.35rem 0.5rem',
    color: '#e2e8f0',
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
  },
  btn: {
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    padding: '0.35rem 0.8rem',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  iframeWrap: {
    flex: 1,
    position: 'relative' as const,
    minHeight: 0,
  },
  iframe: {
    width: '100%',
    height: '100%',
    border: 'none',
    display: 'block',
  },
  drawer: {
    position: 'absolute' as const,
    top: 0,
    right: 0,
    width: 280,
    height: '100%',
    background: 'rgba(30, 41, 59, 0.95)',
    backdropFilter: 'blur(8px)',
    borderLeft: '1px solid #334155',
    padding: '0.6rem',
    overflowY: 'auto' as const,
    zIndex: 10,
  },
  label: {
    display: 'block',
    color: '#94a3b8',
    fontSize: '0.7rem',
    marginBottom: '0.1rem',
  },
  card: {
    background: '#0f172a',
    border: '1px solid #334155',
    borderRadius: 5,
    padding: '0.4rem',
    marginBottom: '0.3rem',
  },
  badge: {
    background: '#6366f1',
    color: 'white',
    fontSize: '0.65rem',
    padding: '0.05rem 0.35rem',
    borderRadius: 8,
    fontWeight: 600,
  },
};
