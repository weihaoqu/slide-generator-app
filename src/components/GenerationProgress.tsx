'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { buildSlideSrcdoc } from '@/lib/slide-preview';

interface GenerationProgressProps {
  requestData: FormData | object;
  isUpload: boolean;
  disciplineCSS?: string;
  themeCSS?: string;
  layoutCSS?: string;
  onGenerationComplete?: (slideId: string, fragments: string[], notes: string[]) => void;
}

interface ProgressState {
  status: 'submitting' | 'generating' | 'complete' | 'error';
  message: string;
  currentSlide: number;
  totalSlides: number;
  slideId?: string;
  slideFragments: string[];
  slideNotes: string[];
}

export default function GenerationProgress({
  requestData,
  isUpload,
  disciplineCSS = '',
  themeCSS = '',
  layoutCSS = '',
  onGenerationComplete,
}: GenerationProgressProps) {
  const [progress, setProgress] = useState<ProgressState>({
    status: 'submitting',
    message: 'Uploading and starting generation...',
    currentSlide: 0,
    totalSlides: 20,
    slideFragments: [],
    slideNotes: [],
  });
  const [slideId, setSlideId] = useState<string | null>(null);
  const sentRef = useRef(false);
  const completedRef = useRef(false);
  const previewEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest slide
  useEffect(() => {
    if (previewEndRef.current && progress.slideFragments.length > 0) {
      previewEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [progress.slideFragments.length]);

  // Notify parent when complete
  useEffect(() => {
    if (
      progress.status === 'complete' &&
      progress.slideId &&
      !completedRef.current &&
      onGenerationComplete
    ) {
      completedRef.current = true;
      onGenerationComplete(progress.slideId, progress.slideFragments, progress.slideNotes);
    }
  }, [progress.status, progress.slideId, progress.slideFragments, progress.slideNotes, onGenerationComplete]);

  // Effect 1: Send the POST request (once, guarded by ref)
  useEffect(() => {
    if (sentRef.current) return;
    sentRef.current = true;

    async function sendRequest() {
      const fetchOptions: RequestInit = { method: 'POST' };

      if (isUpload) {
        fetchOptions.body = requestData as FormData;
      } else {
        fetchOptions.headers = { 'Content-Type': 'application/json' };
        fetchOptions.body = JSON.stringify(requestData);
      }

      const response = await fetch('/api/generate', fetchOptions);

      if (!response.ok) {
        const err = await response.json();
        setProgress((p) => ({ ...p, status: 'error', message: err.error || 'Request failed' }));
        return;
      }

      const { slideId: id } = await response.json();
      setSlideId(id);
      setProgress((p) => ({ ...p, status: 'generating', message: 'Generation in progress...', slideId: id }));
    }

    sendRequest().catch((err) => {
      setProgress((p) => ({
        ...p,
        status: 'error',
        message: (err as Error).message || 'Connection failed',
      }));
    });
  }, [requestData, isUpload]);

  // Effect 2: Poll for status
  useEffect(() => {
    if (!slideId) return;

    const timer = setInterval(async () => {
      try {
        const statusRes = await fetch(`/api/generate/status/${slideId}`);
        if (!statusRes.ok) return;
        const data = await statusRes.json();

        if (data.status === 'generating') {
          setProgress({
            status: 'generating',
            message: data.message,
            currentSlide: data.currentSlide,
            totalSlides: data.totalSlides,
            slideId,
            slideFragments: data.slideFragments || [],
            slideNotes: data.slideNotes || [],
          });
        } else if (data.status === 'complete') {
          clearInterval(timer);
          setProgress({
            status: 'complete',
            message: 'Generation complete!',
            currentSlide: data.currentSlide,
            totalSlides: data.totalSlides,
            slideId,
            slideFragments: data.slideFragments || [],
            slideNotes: data.slideNotes || [],
          });
        } else if (data.status === 'error') {
          clearInterval(timer);
          setProgress((p) => ({ ...p, status: 'error', message: data.message }));
        }
      } catch {
        // poll failed, will retry
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [slideId]);

  const progressPercent = progress.totalSlides > 0
    ? Math.min(100, (progress.currentSlide / progress.totalSlides) * 100)
    : 0;

  const buildSrcdoc = useCallback((fragment: string) => {
    return buildSlideSrcdoc(fragment, disciplineCSS, themeCSS, layoutCSS);
  }, [disciplineCSS, themeCSS, layoutCSS]);

  return (
    <div className="space-y-6">
      {/* Status header */}
      <div className="flex items-center gap-3">
        {(progress.status === 'generating' || progress.status === 'submitting') && (
          <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
        )}
        {progress.status === 'complete' && (
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
        )}
        {progress.status === 'error' && (
          <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] text-white font-bold">!</div>
        )}
        <span className="text-lg font-heading font-semibold text-zinc-200">
          {progress.status === 'submitting' && 'Starting...'}
          {progress.status === 'generating' && `Generating slides (${progress.currentSlide}/${progress.totalSlides})...`}
          {progress.status === 'complete' && 'Done!'}
          {progress.status === 'error' && 'Error'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progress.status === 'error'
              ? 'bg-rose-500'
              : progress.status === 'complete'
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-orange-500 to-amber-400'
          }`}
          style={{ width: `${progress.status === 'complete' ? 100 : progress.status === 'submitting' ? 2 : progressPercent}%` }}
        />
      </div>

      {/* Status message */}
      <p className={`text-sm ${progress.status === 'error' ? 'text-rose-400' : 'text-zinc-500'}`}>
        {progress.message}
      </p>

      {/* Live slide previews */}
      {progress.slideFragments.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-zinc-600 uppercase tracking-wider font-medium">Live Preview</p>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto rounded-xl border border-zinc-800 p-3 bg-zinc-950">
            {progress.slideFragments.map((fragment, i) => (
              fragment && (
                <div key={i} className="relative">
                  <div className="absolute top-2 left-2 z-10 bg-zinc-900/80 text-zinc-500 text-[10px] px-2 py-0.5 rounded-md">
                    {i + 1}/{progress.totalSlides}
                  </div>
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      srcDoc={buildSrcdoc(fragment)}
                      className="absolute inset-0 w-full h-full rounded-lg border border-zinc-800"
                      style={{ pointerEvents: 'none' }}
                      title={`Slide ${i + 1} preview`}
                    />
                  </div>
                </div>
              )
            ))}
            <div ref={previewEndRef} />
          </div>
        </div>
      )}

      {/* Error retry */}
      {progress.status === 'error' && (
        <button
          onClick={() => window.location.reload()}
          className="py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all border border-zinc-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
