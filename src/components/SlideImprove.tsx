'use client';

import { useState, useRef } from 'react';
import { buildSlideSrcdoc } from '@/lib/slide-preview';
import type { SlideDecision } from '@/lib/types';

interface SlideImproveProps {
  slideId: string;
  fragments: string[];
  decisions: SlideDecision[];
  disciplineId: string;
  disciplineCSS: string;
  themeCSS?: string;
  layoutCSS?: string;
  onComplete: (slideId: string) => void;
}

interface ImprovementInput {
  slideIndex: number;
  feedback: string;
}

export default function SlideImprove({
  slideId,
  fragments,
  decisions,
  disciplineId,
  disciplineCSS,
  themeCSS = '',
  layoutCSS = '',
  onComplete,
}: SlideImproveProps) {
  const [improvements, setImprovements] = useState<ImprovementInput[]>(
    decisions.map(d => ({ slideIndex: d.slideIndex, feedback: '' }))
  );
  const [status, setStatus] = useState<'editing' | 'improving' | 'error'>('editing');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState({ current: 0, total: decisions.length });
  const pollingRef = useRef(false);

  const updateFeedback = (slideIndex: number, feedback: string) => {
    setImprovements(prev =>
      prev.map(imp => imp.slideIndex === slideIndex ? { ...imp, feedback } : imp)
    );
  };

  const handleSubmit = async () => {
    setStatus('improving');
    setMessage('Sending improvement requests...');

    try {
      const res = await fetch('/api/generate/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideId,
          improvements: improvements.map(imp => ({
            slideIndex: imp.slideIndex,
            feedback: imp.feedback || 'Please improve this slide',
          })),
          disciplineId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setStatus('error');
        setMessage(err.error || 'Failed to start improvement');
        return;
      }

      const { slideId: improvedId } = await res.json();
      // Poll for completion
      pollForCompletion(improvedId);
    } catch (err) {
      setStatus('error');
      setMessage((err as Error).message || 'Connection failed');
    }
  };

  const pollForCompletion = (id: string) => {
    if (pollingRef.current) return;
    pollingRef.current = true;

    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/generate/status/${id}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.status === 'generating') {
          setMessage(data.message);
          setProgress({ current: data.currentSlide, total: data.totalSlides });
        } else if (data.status === 'complete') {
          clearInterval(timer);
          pollingRef.current = false;
          onComplete(id);
        } else if (data.status === 'error') {
          clearInterval(timer);
          pollingRef.current = false;
          setStatus('error');
          setMessage(data.message);
        }
      } catch {
        // retry
      }
    }, 1500);
  };

  const buildSrcdoc = (fragment: string) => {
    return buildSlideSrcdoc(fragment, disciplineCSS, themeCSS, layoutCSS);
  };

  if (status === 'improving') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-heading font-bold text-zinc-100">Improving Slides</h2>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-lg font-semibold text-zinc-300">{message}</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 5}%` }}
          />
        </div>
        <p className="text-sm text-zinc-500">Re-generating {decisions.length} slide{decisions.length > 1 ? 's' : ''} with your feedback...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-heading font-bold text-zinc-100">Improvement Failed</h2>
        <p className="text-sm text-rose-400">{message}</p>
        <button
          onClick={() => setStatus('editing')}
          className="py-3 px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all border border-zinc-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-zinc-100">
          Improve {decisions.length} Slide{decisions.length > 1 ? 's' : ''}
        </h2>
        <p className="text-sm text-zinc-500 mt-1">
          Describe what should change for each rejected slide. Leave blank for a general improvement.
        </p>
      </div>

      <div className="space-y-6">
        {improvements.map((imp) => (
          <div key={imp.slideIndex} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-zinc-400">Slide {imp.slideIndex + 1}</p>
            <div className="relative w-full opacity-60" style={{ paddingBottom: '56.25%' }}>
              <iframe
                srcDoc={buildSrcdoc(fragments[imp.slideIndex] || '')}
                className="absolute inset-0 w-full h-full rounded-lg border border-zinc-800"
                style={{ pointerEvents: 'none' }}
                title={`Slide ${imp.slideIndex + 1} current`}
              />
            </div>
            <textarea
              value={imp.feedback}
              onChange={(e) => updateFeedback(imp.slideIndex, e.target.value)}
              placeholder="What should change? e.g., 'Add more examples', 'Simplify the diagram', 'Wrong information about X'"
              rows={2}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-all text-sm resize-none"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30"
      >
        Improve & Finalize
      </button>
    </div>
  );
}
