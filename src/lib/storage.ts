import fs from 'fs/promises';
import path from 'path';
import { SlideMetadata } from './types';

const DATA_DIR = path.join(process.cwd(), 'data', 'generated');

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

export async function saveSlides(id: string, html: string, metadata: SlideMetadata): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, `${id}.html`), html, 'utf-8');
  await fs.writeFile(
    path.join(DATA_DIR, `${id}.meta.json`),
    JSON.stringify(metadata, null, 2),
    'utf-8'
  );
}

export async function getSlideHtml(id: string): Promise<string | null> {
  try {
    const filePath = path.join(DATA_DIR, `${id}.html`);
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

export async function getSlideMetadata(id: string): Promise<SlideMetadata | null> {
  try {
    const filePath = path.join(DATA_DIR, `${id}.meta.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function listSlides(): Promise<SlideMetadata[]> {
  await ensureDir();
  const files = await fs.readdir(DATA_DIR);
  const metaFiles = files.filter((f) => f.endsWith('.meta.json'));

  const results: SlideMetadata[] = [];
  for (const file of metaFiles) {
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
      results.push(JSON.parse(raw));
    } catch {
      // skip corrupted metadata files
    }
  }

  // Sort by creation date, newest first
  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return results;
}

export async function saveSlideFragments(id: string, fragments: string[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, `${id}.fragments.json`), JSON.stringify(fragments), 'utf-8');
}

export async function getSlideFragments(id: string): Promise<string[] | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${id}.fragments.json`), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveSlideNotes(id: string, notes: string[]): Promise<void> {
  await ensureDir();
  await fs.writeFile(path.join(DATA_DIR, `${id}.notes.json`), JSON.stringify(notes), 'utf-8');
}

export async function getSlideNotes(id: string): Promise<string[] | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, `${id}.notes.json`), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function cleanupOldSlides(maxAgeMs: number = 48 * 60 * 60 * 1000): Promise<void> {
  await ensureDir();
  const files = await fs.readdir(DATA_DIR);
  const now = Date.now();

  for (const file of files) {
    if (!file.endsWith('.meta.json')) continue;
    try {
      const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf-8');
      const meta: SlideMetadata = JSON.parse(raw);
      if (now - new Date(meta.createdAt).getTime() > maxAgeMs) {
        const id = file.replace('.meta.json', '');
        await fs.unlink(path.join(DATA_DIR, `${id}.html`)).catch(() => {});
        await fs.unlink(path.join(DATA_DIR, `${id}.meta.json`)).catch(() => {});
        await fs.unlink(path.join(DATA_DIR, `${id}.fragments.json`)).catch(() => {});
        await fs.unlink(path.join(DATA_DIR, `${id}.notes.json`)).catch(() => {});
      }
    } catch {
      // skip
    }
  }
}
