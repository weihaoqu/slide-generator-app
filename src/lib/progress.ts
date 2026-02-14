import type { SlideOutline } from './types';

// Attach stores to globalThis so they survive hot-reloads in dev mode.
// In production there's no hot-reload, so this is just a normal singleton.
const g = globalThis as unknown as {
  __progressStore?: Map<string, GenerationProgress>;
  __outlineStore?: Map<string, OutlineProgressState>;
};

// In-memory progress store for active generations
interface GenerationProgress {
  status: 'extracting' | 'generating' | 'complete' | 'error';
  message: string;
  currentSlide: number;
  totalSlides: number;
  slideId: string;
  slideFragments: string[];
  slideNotes: string[];
}

const store = (g.__progressStore ??= new Map<string, GenerationProgress>());

export function setProgress(id: string, progress: GenerationProgress) {
  store.set(id, progress);
}

export function getProgress(id: string): GenerationProgress | undefined {
  return store.get(id);
}

export function clearProgress(id: string) {
  // Clear after a delay so the client can read the final state
  setTimeout(() => store.delete(id), 60_000);
}

// --- Outline progress store ---

interface OutlineProgressState {
  status: 'generating' | 'complete' | 'error';
  message: string;
  outline?: SlideOutline;
}

const outlineStore = (g.__outlineStore ??= new Map<string, OutlineProgressState>());

export function setOutlineProgress(id: string, progress: OutlineProgressState) {
  outlineStore.set(id, progress);
}

export function getOutlineProgress(id: string): OutlineProgressState | undefined {
  return outlineStore.get(id);
}

export function clearOutlineProgress(id: string) {
  // 5-minute TTL — outline review takes longer than generation
  setTimeout(() => outlineStore.delete(id), 300_000);
}
