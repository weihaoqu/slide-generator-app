'use client';

import { useState, useEffect } from 'react';

interface DeckSummary {
  slug: string;
  deckUrl: string;
  count: number;
  lastTs: string;
}

interface FeedbackEntry {
  id: string;
  page: number;
  text: string;
  author: string;
  ts: string;
  deckUrl: string;
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<DeckSummary | null>(null);
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/feedback?deck=__check__')
      .then(r => { setAuthed(r.status !== 401); setChecking(false); })
      .catch(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch('/api/feedback')
      .then(r => r.json())
      .then(setDecks)
      .catch(() => {});
  }, [authed]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/feedback/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) setAuthed(true);
    else setAuthError('Wrong password');
  };

  const loadDeck = async (deck: DeckSummary) => {
    setSelectedDeck(deck);
    setLoading(true);
    const res = await fetch(`/api/feedback?deck=${encodeURIComponent(deck.deckUrl)}`);
    if (res.ok) setEntries(await res.json());
    setLoading(false);
  };

  const deleteEntry = async (entry: FeedbackEntry) => {
    if (!confirm('Delete this feedback entry?')) return;
    const res = await fetch('/api/feedback', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckUrl: entry.deckUrl, id: entry.id }),
    });
    if (res.ok) {
      setEntries(prev => prev.filter(e => e.id !== entry.id));
      setDecks(prev => prev.map(d =>
        d.slug === selectedDeck?.slug ? { ...d, count: d.count - 1 } : d
      ));
    }
  };

  const deckLabel = (url: string) => {
    try {
      const parts = url.split('/');
      const file = parts[parts.length - 1].replace('.html', '').replace(/-enhanced|-explained/, '');
      const course = parts[parts.length - 2] || '';
      return `${course.toUpperCase()} / ${file.replace(/-/g, ' ')}`;
    } catch {
      return url;
    }
  };

  if (checking) return <div style={S.page}><p style={{ color: '#94a3b8' }}>Loading...</p></div>;

  if (!authed) {
    return (
      <div style={S.page}>
        <div style={S.authBox}>
          <h1 style={S.title}>Feedback Admin</h1>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Enter password to manage feedback</p>
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

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h1 style={S.title}>Feedback Admin</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="/api/feedback/export" style={S.dlBtn} download>JSON (all)</a>
          <a href="/api/feedback/export?format=csv" style={S.dlBtn} download>CSV (all)</a>
          <a href="/feedback" style={{ ...S.dlBtn, background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderColor: 'rgba(99,102,241,0.3)' }}>Feedback viewer</a>
        </div>
      </div>

      {!selectedDeck ? (
        <div style={S.deckList}>
          {decks.length === 0 && <p style={{ color: '#64748b' }}>No feedback collected yet.</p>}
          {decks.sort((a, b) => b.lastTs.localeCompare(a.lastTs)).map(d => (
            <div key={d.slug} style={S.deckCard} onClick={() => loadDeck(d)}>
              <div>
                <div style={{ color: '#e2e8f0', fontWeight: 500, marginBottom: '0.25rem' }}>{deckLabel(d.deckUrl)}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', wordBreak: 'break-all' as const }}>{d.deckUrl}</div>
              </div>
              <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                <div style={{ color: '#93c5fd', fontSize: '1.5rem', fontWeight: 700 }}>{d.count}</div>
                <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{new Date(d.lastTs).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={S.detailView}>
          <div style={S.detailHeader}>
            <button onClick={() => { setSelectedDeck(null); setEntries([]); }} style={S.backBtn}>&larr; Back</button>
            <h2 style={{ color: '#e2e8f0', fontSize: '1.1rem', margin: 0 }}>{deckLabel(selectedDeck.deckUrl)}</h2>
            <div style={{ display: 'flex', gap: '0.4rem', marginLeft: 'auto' }}>
              <a href={`/api/feedback/export?deck=${selectedDeck.slug}`} style={S.dlBtnSm} download>JSON</a>
              <a href={`/api/feedback/export?deck=${selectedDeck.slug}&format=csv`} style={S.dlBtnSm} download>CSV</a>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#94a3b8', padding: '2rem', textAlign: 'center' as const }}>Loading...</p>
          ) : (
            <div style={S.entryList}>
              {entries.length === 0 && <p style={{ color: '#64748b' }}>No entries.</p>}
              {[...entries].reverse().map(e => (
                <div key={e.id} style={S.entryCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <span style={S.badge}>Page {e.page}</span>
                    <span style={{ color: '#93c5fd', fontSize: '0.85rem', fontWeight: 500 }}>{e.author || 'Anonymous'}</span>
                    <span style={{ color: '#475569', fontSize: '0.8rem', marginLeft: 'auto' }}>
                      {new Date(e.ts).toLocaleDateString()} {new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <button onClick={() => deleteEntry(e)} style={S.deleteBtn} title="Delete">✕</button>
                  </div>
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>{e.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#0f172a',
    color: '#e2e8f0',
    padding: '1.5rem 2rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  title: {
    fontSize: '1.5rem',
    background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
  },
  authBox: {
    maxWidth: 400,
    margin: '80px auto 0',
    textAlign: 'center' as const,
  },
  input: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 6,
    padding: '0.5rem 0.75rem',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
  },
  btn: {
    background: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    padding: '0.5rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    gap: '0.75rem',
  },
  dlBtn: {
    color: '#86efac',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: 6,
    padding: '0.35rem 0.75rem',
    fontSize: '0.8rem',
    textDecoration: 'none',
    fontWeight: 500,
  },
  dlBtnSm: {
    color: '#86efac',
    background: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.2)',
    borderRadius: 5,
    padding: '0.2rem 0.5rem',
    fontSize: '0.75rem',
    textDecoration: 'none',
  },
  deckList: {
    maxWidth: 800,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  deckCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 10,
    padding: '1rem 1.25rem',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  },
  detailView: {
    maxWidth: 900,
  },
  detailHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
    flexWrap: 'wrap' as const,
  },
  backBtn: {
    background: '#334155',
    color: '#e2e8f0',
    border: 'none',
    borderRadius: 6,
    padding: '0.3rem 0.6rem',
    fontSize: '0.85rem',
    cursor: 'pointer',
  },
  entryList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  entryCard: {
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: 8,
    padding: '0.75rem 1rem',
  },
  badge: {
    background: '#6366f1',
    color: 'white',
    fontSize: '0.75rem',
    padding: '0.15rem 0.5rem',
    borderRadius: 10,
    fontWeight: 600,
  },
  deleteBtn: {
    background: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.2)',
    borderRadius: 5,
    padding: '0.15rem 0.4rem',
    fontSize: '0.75rem',
    cursor: 'pointer',
    lineHeight: 1,
  },
};
