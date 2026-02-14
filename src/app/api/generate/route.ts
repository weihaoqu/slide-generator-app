import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { extractPptxText } from '@/lib/extract-pptx';
import { extractPdfText } from '@/lib/extract-pdf';
import { generateSlides } from '@/lib/claude';
import { saveSlides, saveSlideFragments, saveSlideNotes, cleanupOldSlides } from '@/lib/storage';
import { SlideMetadata, ApprovedOutline } from '@/lib/types';
import { setProgress, getProgress, clearProgress } from '@/lib/progress';

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
  let approvedOutline: ApprovedOutline | undefined;
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
      approvedOutline = body.approvedOutline;
      disciplineId = body.disciplineId;

      // When using an approved outline, topic is optional (embedded in outline)
      if (!approvedOutline && (!topic || topic.trim().length < 2)) {
        return Response.json({ error: 'Topic is required' }, { status: 400 });
      }
    }
  } catch (error) {
    return Response.json(
      { error: 'Failed to parse request: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 400 }
    );
  }

  cleanupOldSlides().catch(() => {});

  const slideId = uuidv4();

  // Set initial progress
  const estimatedTotal = approvedOutline
    ? approvedOutline.slides.filter(s => s.enabled).length
    : (slideCount || 20);
  setProgress(slideId, {
    status: 'generating',
    message: 'Starting generation...',
    currentSlide: 0,
    totalSlides: estimatedTotal,
    slideId,
    slideFragments: [],
    slideNotes: [],
  });

  // Fire and forget — client will poll for progress
  generateSlides(
    { mode, extractedText, sourceFilename, topic, courseLevel, slideCount, notes, approvedOutline, disciplineId },
    {
      onProgress(currentSlide, totalSlides) {
        const current = getProgress(slideId);
        setProgress(slideId, {
          status: 'generating',
          message: `Generating slide ${currentSlide} of ${totalSlides}...`,
          currentSlide,
          totalSlides,
          slideId,
          slideFragments: current?.slideFragments || [],
          slideNotes: current?.slideNotes || [],
        });
      },
      onSlideComplete(slideIndex, fragment) {
        const current = getProgress(slideId);
        if (current) {
          const fragments = [...(current.slideFragments || [])];
          fragments[slideIndex] = fragment;
          setProgress(slideId, { ...current, slideFragments: fragments });
        }
      },
      onNoteComplete(slideIndex, note) {
        const current = getProgress(slideId);
        if (current) {
          const notes = [...(current.slideNotes || [])];
          notes[slideIndex] = note;
          setProgress(slideId, { ...current, slideNotes: notes });
        }
      },
      async onComplete(html, fragments, notes) {
        const actualSlides = (html.match(/id="s\d+"/g) || []).length;
        const fileSize = Buffer.byteLength(html, 'utf-8');

        const metadata: SlideMetadata = {
          id: slideId,
          title: topic || sourceFilename || 'Untitled',
          source: mode,
          sourceFilename,
          topic,
          courseLevel,
          disciplineId,
          slideCount: actualSlides,
          fileSize,
          createdAt: new Date().toISOString(),
        };

        await saveSlides(slideId, html, metadata);
        if (fragments.length > 0) await saveSlideFragments(slideId, fragments);
        if (notes.length > 0) await saveSlideNotes(slideId, notes);

        setProgress(slideId, {
          status: 'complete',
          message: 'Done!',
          currentSlide: actualSlides,
          totalSlides: actualSlides,
          slideId,
          slideFragments: fragments,
          slideNotes: notes,
        });
        clearProgress(slideId);
      },
      onError(error) {
        setProgress(slideId, {
          status: 'error',
          message: error,
          currentSlide: 0,
          totalSlides: slideCount || 20,
          slideId,
          slideFragments: [],
          slideNotes: [],
        });
        clearProgress(slideId);
      },
    }
  );

  // Return immediately with the slideId — client polls /api/generate/status
  return Response.json({ slideId });
}
