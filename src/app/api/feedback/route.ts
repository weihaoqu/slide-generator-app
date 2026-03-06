import { cookies } from 'next/headers';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data', 'feedback');
const COOKIE_NAME = 'feedback_auth';

async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value === 'authenticated';
}

function slugify(url: string): string {
  return url
    .replace(/^https?:\/\//, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

async function ensureDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function readFeedback(slug: string): Promise<unknown[]> {
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (!existsSync(filePath)) return [];
  const data = await readFile(filePath, 'utf-8');
  return JSON.parse(data);
}

async function writeFeedback(slug: string, entries: unknown[]) {
  await ensureDir();
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  await writeFile(filePath, JSON.stringify(entries, null, 2));
}

export async function GET(req: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const deckUrl = searchParams.get('deck');
  if (!deckUrl) {
    return Response.json({ error: 'Missing deck parameter' }, { status: 400 });
  }

  const slug = slugify(deckUrl);
  const entries = await readFeedback(slug);
  return Response.json(entries);
}

export async function POST(req: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { deckUrl, page, text, author } = await req.json();

  if (!deckUrl || !page || !text) {
    return Response.json({ error: 'Missing required fields (deckUrl, page, text)' }, { status: 400 });
  }

  const slug = slugify(deckUrl);
  const entries = await readFeedback(slug);

  const entry = {
    id: randomUUID(),
    page: Number(page),
    text: String(text).slice(0, 2000),
    author: String(author || 'Anonymous').slice(0, 100),
    ts: new Date().toISOString(),
    deckUrl,
  };

  entries.push(entry);
  await writeFeedback(slug, entries);

  return Response.json(entry, { status: 201 });
}
