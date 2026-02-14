import { NextRequest } from 'next/server';
import { regenerateSlides } from '@/lib/claude';
import { getSlideFragments, getSlideMetadata, saveSlides, saveSlideFragments, saveSlideNotes, getSlideNotes } from '@/lib/storage';
import { SlideMetadata } from '@/lib/types';
import { setProgress, getProgress, clearProgress } from '@/lib/progress';
import { getDiscipline } from '@/lib/disciplines';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slideId, improvements, disciplineId } = body as {
      slideId: string;
      improvements: Array<{ slideIndex: number; feedback: string }>;
      disciplineId: string;
    };

    if (!slideId || !improvements || improvements.length === 0) {
      return Response.json({ error: 'Missing slideId or improvements' }, { status: 400 });
    }

    // Load existing data
    const fragments = await getSlideFragments(slideId);
    const metadata = await getSlideMetadata(slideId);
    const existingNotes = await getSlideNotes(slideId) || [];

    if (!fragments || !metadata) {
      return Response.json({ error: 'Slide data not found' }, { status: 404 });
    }

    const discipline = getDiscipline(disciplineId);

    // Set initial progress
    setProgress(slideId, {
      status: 'generating',
      message: `Improving ${improvements.length} slide${improvements.length > 1 ? 's' : ''}...`,
      currentSlide: 0,
      totalSlides: improvements.length,
      slideId,
      slideFragments: fragments,
      slideNotes: existingNotes,
    });

    // Fire and forget
    regenerateSlides(
      fragments,
      improvements,
      discipline,
      {
        onProgress(current, total) {
          const prog = getProgress(slideId);
          setProgress(slideId, {
            status: 'generating',
            message: `Improving slide ${current} of ${total}...`,
            currentSlide: current,
            totalSlides: total,
            slideId,
            slideFragments: prog?.slideFragments || fragments,
            slideNotes: prog?.slideNotes || existingNotes,
          });
        },
        onSlideComplete(slideIndex, fragment) {
          const prog = getProgress(slideId);
          if (prog) {
            const updatedFragments = [...(prog.slideFragments || [])];
            updatedFragments[slideIndex] = fragment;
            setProgress(slideId, { ...prog, slideFragments: updatedFragments });
          }
        },
        onNoteComplete(slideIndex, note) {
          const prog = getProgress(slideId);
          if (prog) {
            const updatedNotes = [...(prog.slideNotes || [])];
            updatedNotes[slideIndex] = note;
            setProgress(slideId, { ...prog, slideNotes: updatedNotes });
          }
        },
        async onComplete(html, updatedFragments, updatedNotes) {
          const actualSlides = (html.match(/id="s\d+"/g) || []).length;
          const fileSize = Buffer.byteLength(html, 'utf-8');

          const updatedMetadata: SlideMetadata = {
            ...metadata,
            slideCount: actualSlides,
            fileSize,
          };

          await saveSlides(slideId, html, updatedMetadata);
          await saveSlideFragments(slideId, updatedFragments);
          // Merge notes: keep existing for unchanged slides, update for improved ones
          const mergedNotes = [...existingNotes];
          for (let i = 0; i < updatedNotes.length; i++) {
            if (updatedNotes[i]) mergedNotes[i] = updatedNotes[i];
          }
          await saveSlideNotes(slideId, mergedNotes);

          setProgress(slideId, {
            status: 'complete',
            message: 'Improvements complete!',
            currentSlide: actualSlides,
            totalSlides: actualSlides,
            slideId,
            slideFragments: updatedFragments,
            slideNotes: mergedNotes,
          });
          clearProgress(slideId);
        },
        onError(error) {
          setProgress(slideId, {
            status: 'error',
            message: error,
            currentSlide: 0,
            totalSlides: improvements.length,
            slideId,
            slideFragments: fragments,
            slideNotes: existingNotes,
          });
          clearProgress(slideId);
        },
      }
    );

    return Response.json({ slideId });
  } catch (error) {
    return Response.json(
      { error: 'Failed to parse request: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 400 }
    );
  }
}
