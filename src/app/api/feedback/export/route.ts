import { cookies } from 'next/headers';
import { readFile, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'feedback');
const COOKIE_NAME = 'feedback_auth';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === 'authenticated';
}

interface FeedbackEntry {
  id: string;
  page: number;
  text: string;
  author: string;
  ts: string;
  deckUrl: string;
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!existsSync(DATA_DIR)) {
    return Response.json({ decks: [] });
  }

  const { searchParams } = new URL(req.url);
  const deckSlug = searchParams.get('deck');
  const format = searchParams.get('format') || 'json';

  const files = await readdir(DATA_DIR);
  const allFeedback: Record<string, FeedbackEntry[]> = {};

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const slug = file.replace('.json', '');
    if (deckSlug && slug !== deckSlug) continue;
    const data = await readFile(path.join(DATA_DIR, file), 'utf-8');
    allFeedback[slug] = JSON.parse(data);
  }

  if (format === 'csv') {
    const rows = ['Deck,Page,Author,Date,Feedback'];
    for (const [deck, entries] of Object.entries(allFeedback)) {
      for (const e of entries) {
        const csvText = `"${e.text.replace(/"/g, '""')}"`;
        rows.push(`${deck},${e.page},"${e.author}",${e.ts},${csvText}`);
      }
    }
    const filename = deckSlug ? `feedback-${deckSlug}.csv` : `feedback-all-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response(rows.join('\n'), {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  }

  const filename = deckSlug ? `feedback-${deckSlug}.json` : `feedback-all-${new Date().toISOString().slice(0, 10)}.json`;
  return new Response(JSON.stringify(allFeedback, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
