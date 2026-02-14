import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { extractPptxText } from '@/lib/extract-pptx';
import { extractPdfText } from '@/lib/extract-pdf';
import { generateOutline } from '@/lib/claude';
import { setOutlineProgress, clearOutlineProgress } from '@/lib/progress';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const contentType = request.headers.get('content-type') || '';
  let mode: 'upload' | 'topic';
  let extractedText: string | undefined;
  let sourceFilename: string | undefined;
  let topic: string | undefined;
  let courseLevel: string | undefined;
  let slideCount: number | undefined;
  let notes: string | undefined;
  let disciplineId: string | undefined;

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return Response.json({ error: 'No file provided' }, { status: 400 });
      }

      mode = 'upload';
      sourceFilename = file.name;
      slideCount = parseInt(formData.get('slideCount') as string) || 20;
      disciplineId = (formData.get('disciplineId') as string) || undefined;
      const buffer = Buffer.from(await file.arrayBuffer());

      if (file.name.endsWith('.pptx')) {
        extractedText = await extractPptxText(buffer);
      } else if (file.name.endsWith('.pdf')) {
        extractedText = await extractPdfText(buffer);
      } else {
        return Response.json({ error: 'Unsupported file type. Use .pptx or .pdf' }, { status: 400 });
      }

      if (!extractedText || extractedText.trim().length < 50) {
        return Response.json(
          { error: 'Could not extract enough text from the file. The file may be image-based or empty.' },
          { status: 400 }
        );
      }
    } else {
      const body = await request.json();
      mode = 'topic';
      topic = body.topic;
      courseLevel = body.courseLevel;
      slideCount = body.slideCount;
      notes = body.notes;
      disciplineId = body.disciplineId;

      if (!topic || topic.trim().length < 2) {
        return Response.json({ error: 'Topic is required' }, { status: 400 });
      }
    }
  } catch (error) {
    return Response.json(
      { error: 'Failed to parse request: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 400 }
    );
  }

  const outlineId = uuidv4();

  console.log('[outline] request received', {
    mode,
    sourceFilename,
    topic,
    disciplineId,
    extractedTextLength: extractedText?.length ?? 0,
  });

  setOutlineProgress(outlineId, {
    status: 'generating',
    message: 'Analyzing topic and building outline...',
  });

  // Fire and forget — client polls /api/outline/status/[id]
  generateOutline(
    { mode, extractedText, sourceFilename, topic, courseLevel, slideCount, notes, disciplineId },
    (message) => {
      setOutlineProgress(outlineId, { status: 'generating', message });
    },
    (outline) => {
      setOutlineProgress(outlineId, {
        status: 'complete',
        message: 'Outline ready',
        outline,
      });
      clearOutlineProgress(outlineId);
    },
    (error) => {
      setOutlineProgress(outlineId, {
        status: 'error',
        message: error,
      });
      clearOutlineProgress(outlineId);
    }
  ).catch((err) => {
    console.error('[outline] unhandled:', err);
    setOutlineProgress(outlineId, {
      status: 'error',
      message: err instanceof Error ? err.message : 'Unexpected error',
    });
    clearOutlineProgress(outlineId);
  });

  return Response.json({ outlineId });
}
