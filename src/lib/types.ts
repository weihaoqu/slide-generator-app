export interface SlideMetadata {
  id: string;
  title: string;
  source: 'upload' | 'topic';
  sourceFilename?: string;
  topic?: string;
  courseLevel?: string;
  disciplineId?: string;
  themeId?: string;
  layoutId?: string;
  slideCount: number;
  fileSize: number;
  createdAt: string;
}

export interface GenerateRequest {
  mode: 'upload' | 'topic';
  // For topic mode
  topic?: string;
  courseLevel?: string;
  slideCount?: number;
  notes?: string;
  disciplineId?: string;
  // For upload mode - file comes via FormData
}

export interface SSEEvent {
  type: 'progress' | 'complete' | 'error';
  message?: string;
  currentSlide?: number;
  totalSlides?: number;
  slideId?: string;
}

// --- Outline review types ---

export interface TeachingSuggestion {
  id: string;
  type: string;
  text: string;
  accepted: boolean;
}

export interface OutlineSlide {
  id: string;
  slideNumber: number;
  title: string;
  bullets: string[];
  suggestions: TeachingSuggestion[];
  enabled: boolean;
  userNotes: string;
}

export interface ContentSuggestion {
  id: string;
  action: 'add' | 'skip' | 'expand';
  description: string;
  accepted: boolean;
}

export interface SlideOutline {
  topic: string;
  courseLevel: string;
  estimatedSlideCount: number;
  summary: string;
  slides: OutlineSlide[];
  contentSuggestions: ContentSuggestion[];
  extractedText?: string;
}

export interface SlideDecision {
  slideIndex: number;
  status: 'approved' | 'needs-work';
}

export interface ApprovedOutline {
  outlineId: string;
  topic?: string;
  courseLevel?: string;
  extractedText?: string;
  slides: OutlineSlide[];
  contentSuggestions: ContentSuggestion[];
  includeSvg?: boolean;
  quality?: 'standard' | 'quality';
  themeId?: string;
  layoutId?: string;
}
