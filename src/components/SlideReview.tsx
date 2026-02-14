'use client';

import { useState, useEffect, useCallback } from 'react';
import { buildSlideSrcdoc } from '@/lib/slide-preview';
import type { SlideDecision } from '@/lib/types';

interface SlideReviewProps {
  slideId: string;
  fragments: string[];
  notes: string[];
  disciplineCSS: string;
  themeCSS?: string;
  layoutCSS?: string;
  onComplete: (decisions: SlideDecision[]) => void;
  onSkip: () => void;
}

export default function SlideReview({
  slideId,
  fragments,
  notes,
  disciplineCSS,
  themeCSS = '',
  layoutCSS = '',
  onComplete,
  onSkip,
}: SlideReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [decisions, setDecisions] = useState<Map<number, 'approved' | 'needs-work'>>(new Map());

  const totalSlides = fragments.length;
  const reviewed = decisions.size;
  const currentDecision = decisions.get(currentIndex);

  const setDecision = useCallback((status: 'approved' | 'needs-work') => {
    setDecisions(prev => {
      const next = new Map(prev);
      next.set(currentIndex, status);
      return next;
    });
    // Auto-advance to next unreviewed slide
    if (currentIndex < totalSlides - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, totalSlides]);

  const goTo = useCallback((index: number) => {
    if (index >= 0 && index < totalSlides) {
      setCurrentIndex(index);
    }
  }, [totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(currentIndex + 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        setDecision('approved');
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        setDecision('needs-work');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, goTo, setDecision]);

  const handleFinish = () => {
    const result: SlideDecision[] = [];
    for (let i = 0; i < totalSlides; i++) {
      result.push({
        slideIndex: i,
        status: decisions.get(i) || 'approved', // default unreviewed to approved
      });
    }
    onComplete(result);
  };

  const srcdoc = buildSlideSrcdoc(fragments[currentIndex] || '', disciplineCSS, themeCSS, layoutCSS);

  const currentNote = notes[currentIndex] || '';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-bold text-zinc-100">Review Your Slides</h2>
          <p className="text-sm text-zinc-500 mt-1">Slide {currentIndex + 1} of {totalSlides}</p>
        </div>
        <button
          onClick={onSkip}
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Skip Review
        </button>
      </div>

      {/* Main content: slide + notes side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Slide preview */}
        <div className="lg:col-span-2">
          <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
            <iframe
              srcDoc={srcdoc}
              className="absolute inset-0 w-full h-full rounded-xl border border-zinc-800"
              title={`Slide ${currentIndex + 1}`}
            />
          </div>
        </div>

        {/* Lecture notes panel */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-y-auto lg:max-h-[50vh]">
          <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Lecture Notes</h3>
          {currentNote ? (
            <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{currentNote}</p>
          ) : (
            <p className="text-sm text-zinc-600 italic">Notes generating...</p>
          )}
        </div>
      </div>

      {/* Navigation + decision buttons */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all border border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          Prev
        </button>

        <div className="flex gap-2">
          <button
            onClick={() => setDecision('approved')}
            className={`py-2.5 px-5 rounded-lg font-medium text-sm transition-all ${
              currentDecision === 'approved'
                ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
                : 'bg-zinc-800 hover:bg-emerald-500/10 border border-zinc-700 hover:border-emerald-500/30 text-zinc-300'
            }`}
          >
            Looks Good
          </button>
          <button
            onClick={() => setDecision('needs-work')}
            className={`py-2.5 px-5 rounded-lg font-medium text-sm transition-all ${
              currentDecision === 'needs-work'
                ? 'bg-rose-500/20 border border-rose-500/50 text-rose-300'
                : 'bg-zinc-800 hover:bg-rose-500/10 border border-zinc-700 hover:border-rose-500/30 text-zinc-300'
            }`}
          >
            Needs Work
          </button>
        </div>

        <button
          onClick={() => goTo(currentIndex + 1)}
          disabled={currentIndex === totalSlides - 1}
          className="py-2 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-all border border-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
        >
          Next
        </button>
      </div>

      {/* Progress indicator */}
      <div className="space-y-2">
        <div className="flex gap-1">
          {Array.from({ length: totalSlides }, (_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 flex-1 rounded-full transition-all ${
                i === currentIndex
                  ? 'bg-orange-400'
                  : decisions.get(i) === 'approved'
                    ? 'bg-emerald-500/60'
                    : decisions.get(i) === 'needs-work'
                      ? 'bg-rose-500/60'
                      : 'bg-zinc-800'
              }`}
              title={`Slide ${i + 1}${decisions.get(i) ? ` (${decisions.get(i)})` : ''}`}
            />
          ))}
        </div>
        <p className="text-xs text-zinc-600 text-center">
          {reviewed}/{totalSlides} reviewed
          <span className="text-zinc-700 mx-2">|</span>
          <span className="text-zinc-600">Enter = approve, Backspace = needs work, arrows = navigate</span>
        </p>
      </div>

      {/* Finish button */}
      <button
        onClick={handleFinish}
        className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30"
      >
        {reviewed >= totalSlides ? 'Finish Review' : `Finish Review (${totalSlides - reviewed} unreviewed will be approved)`}
      </button>
    </div>
  );
}
