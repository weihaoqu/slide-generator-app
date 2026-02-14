'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import UploadForm from '@/components/UploadForm';
import TopicForm from '@/components/TopicForm';
import GenerationProgress from '@/components/GenerationProgress';
import OutlineReview from '@/components/OutlineReview';
import SlideReview from '@/components/SlideReview';
import SlideImprove from '@/components/SlideImprove';
import DisciplineSelector from '@/components/DisciplineSelector';
import { getDiscipline } from '@/lib/disciplines';
import type { SlideOutline, ApprovedOutline, SlideDecision } from '@/lib/types';

type Phase = 'input' | 'outlining' | 'reviewing' | 'generating'
           | 'slide-review' | 'improving';

function GenerateContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get('mode') === 'upload' ? 'upload' : 'topic';

  const [mode, setMode] = useState<'upload' | 'topic'>(initialMode);
  const [phase, setPhase] = useState<Phase>('input');
  const [requestData, setRequestData] = useState<FormData | object | null>(null);
  const [disciplineId, setDisciplineId] = useState('cs');
  const discipline = getDiscipline(disciplineId);

  // Outline state
  const [outlineId, setOutlineId] = useState<string | null>(null);
  const [outline, setOutline] = useState<SlideOutline | null>(null);
  const [outlineError, setOutlineError] = useState<string | null>(null);
  const [outlineMessage, setOutlineMessage] = useState('Building outline...');

  // For upload flow, stash the file data so we can re-send to /api/outline
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadSlideCount, setUploadSlideCount] = useState(20);

  // Post-generation state
  const [generatedSlideId, setGeneratedSlideId] = useState<string | null>(null);
  const [slideFragments, setSlideFragments] = useState<string[]>([]);
  const [slideNotes, setSlideNotes] = useState<string[]>([]);
  const [slideDecisions, setSlideDecisions] = useState<SlideDecision[]>([]);

  const pollingRef = useRef(false);

  const handleUpload = async (file: File, slideCount: number) => {
    setUploadFile(file);
    setUploadSlideCount(slideCount);
    setPhase('outlining');
    setOutlineError(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('slideCount', String(slideCount));
    formData.append('disciplineId', disciplineId);

    try {
      const res = await fetch('/api/outline', { method: 'POST', body: formData });
      if (!res.ok) {
        const err = await res.json();
        setOutlineError(err.error || 'Failed to start outline');
        setPhase('input');
        return;
      }
      const { outlineId: id } = await res.json();
      setOutlineId(id);
    } catch (err) {
      setOutlineError((err as Error).message || 'Connection failed');
      setPhase('input');
    }
  };

  const handleTopic = async (data: { topic: string; courseLevel: string; slideCount: number; notes: string }) => {
    setPhase('outlining');
    setOutlineError(null);

    try {
      const res = await fetch('/api/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, disciplineId }),
      });
      if (!res.ok) {
        const err = await res.json();
        setOutlineError(err.error || 'Failed to start outline');
        setPhase('input');
        return;
      }
      const { outlineId: id } = await res.json();
      setOutlineId(id);
    } catch (err) {
      setOutlineError((err as Error).message || 'Connection failed');
      setPhase('input');
    }
  };

  // Poll for outline completion
  useEffect(() => {
    if (phase !== 'outlining' || !outlineId) return;
    if (pollingRef.current) return;
    pollingRef.current = true;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/outline/status/${outlineId}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.message) {
          setOutlineMessage(data.message);
        }

        if (data.status === 'complete' && data.outline) {
          clearInterval(timer);
          pollingRef.current = false;
          setOutline(data.outline);
          setPhase('reviewing');
        } else if (data.status === 'error') {
          clearInterval(timer);
          pollingRef.current = false;
          setOutlineError(data.message || 'Outline generation failed');
          setPhase('input');
        }
      } catch {
        // poll failed, will retry
      }
    }, 1500);

    return () => {
      clearInterval(timer);
      pollingRef.current = false;
    };
  }, [phase, outlineId]);

  const handleApprove = (approved: ApprovedOutline) => {
    const enabledSlides = approved.slides.filter(s => s.enabled);
    setRequestData({
      topic: approved.topic,
      courseLevel: approved.courseLevel,
      slideCount: enabledSlides.length,
      approvedOutline: approved,
      disciplineId,
    });
    setPhase('generating');
  };

  const handleBack = () => {
    setPhase('input');
    setOutlineId(null);
    setOutline(null);
    setOutlineError(null);
    setOutlineMessage('Building outline...');
  };

  const handleGenerationComplete = useCallback((slideId: string, fragments: string[], notes: string[]) => {
    setGeneratedSlideId(slideId);
    setSlideFragments(fragments);
    setSlideNotes(notes);
    // Auto-transition to slide review if we have fragments
    if (fragments.length > 0) {
      setPhase('slide-review');
    }
  }, []);

  const handleReviewComplete = (decisions: SlideDecision[]) => {
    setSlideDecisions(decisions);
    const rejected = decisions.filter(d => d.status === 'needs-work');
    if (rejected.length > 0) {
      setPhase('improving');
    } else {
      // All approved — go to preview
      if (generatedSlideId) {
        router.push(`/preview/${generatedSlideId}`);
      }
    }
  };

  const handleReviewSkip = () => {
    if (generatedSlideId) {
      router.push(`/preview/${generatedSlideId}`);
    }
  };

  const handleImproveComplete = (updatedSlideId: string) => {
    router.push(`/preview/${updatedSlideId}`);
  };

  // --- Phase: outlining ---
  if (phase === 'outlining') {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-zinc-100 mb-8">Analyzing Content</h1>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-lg font-heading font-semibold text-zinc-300">{outlineMessage}</span>
          </div>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full w-1/3 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-zinc-500">
            Claude is analyzing the topic and creating a structured outline with teaching suggestions. This usually takes 10-20 seconds.
          </p>
        </div>
      </div>
    );
  }

  // --- Phase: reviewing ---
  if (phase === 'reviewing' && outline && outlineId) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-zinc-100 mb-2">Review Outline</h1>
        <p className="text-zinc-500 mb-6">
          Toggle slides on/off, accept or reject teaching suggestions, and add per-slide notes before generating.
        </p>
        <OutlineReview
          outline={outline}
          outlineId={outlineId}
          onApprove={handleApprove}
          onBack={handleBack}
          discipline={discipline}
        />
      </div>
    );
  }

  // --- Phase: generating ---
  if (phase === 'generating' && requestData) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-heading font-bold text-zinc-100 mb-8">Generating Slides</h1>
        <GenerationProgress
          requestData={requestData}
          isUpload={false}
          disciplineCSS={discipline.extraCSS}
          onGenerationComplete={handleGenerationComplete}
        />
      </div>
    );
  }

  // --- Phase: slide-review ---
  if (phase === 'slide-review' && generatedSlideId && slideFragments.length > 0) {
    return (
      <div className="max-w-5xl mx-auto">
        <SlideReview
          slideId={generatedSlideId}
          fragments={slideFragments}
          notes={slideNotes}
          disciplineCSS={discipline.extraCSS}
          onComplete={handleReviewComplete}
          onSkip={handleReviewSkip}
        />
      </div>
    );
  }

  // --- Phase: improving ---
  if (phase === 'improving' && generatedSlideId && slideDecisions.length > 0) {
    const rejected = slideDecisions.filter(d => d.status === 'needs-work');
    return (
      <div className="max-w-4xl mx-auto">
        <SlideImprove
          slideId={generatedSlideId}
          fragments={slideFragments}
          decisions={rejected}
          disciplineId={disciplineId}
          disciplineCSS={discipline.extraCSS}
          onComplete={handleImproveComplete}
        />
      </div>
    );
  }

  // --- Phase: input ---
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-heading font-bold text-zinc-100 mb-2">Generate Slides</h1>
      <p className="text-zinc-500 mb-8">
        Upload a presentation file or enter a topic to generate an interactive slide deck.
      </p>

      {outlineError && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm text-rose-400">
          {outlineError}
        </div>
      )}

      {/* Discipline selector */}
      <DisciplineSelector selected={disciplineId} onChange={setDisciplineId} />

      {/* Mode toggle */}
      <div className="flex bg-zinc-900 rounded-xl p-1 mb-8 border border-zinc-800">
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === 'upload'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode('topic')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
            mode === 'topic'
              ? 'bg-zinc-800 text-zinc-100 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Enter Topic
        </button>
      </div>

      {/* Form */}
      {mode === 'upload' ? (
        <UploadForm onSubmit={handleUpload} />
      ) : (
        <TopicForm onSubmit={handleTopic} discipline={discipline} />
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="text-zinc-500">Loading...</div>}>
      <GenerateContent />
    </Suspense>
  );
}
