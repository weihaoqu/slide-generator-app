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

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!existsSync(DATA_DIR)) {
    return Response.json({ decks: [] });
  }

  const files = await readdir(DATA_DIR);
  const allFeedback: Record<string, unknown[]> = {};

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const data = await readFile(path.join(DATA_DIR, file), 'utf-8');
    const entries = JSON.parse(data);
    const deckName = file.replace('.json', '');
    allFeedback[deckName] = entries;
  }

  return new Response(JSON.stringify(allFeedback, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="feedback-export-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
