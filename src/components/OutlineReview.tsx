'use client';

import { useState, useCallback, useMemo } from 'react';
import type { SlideOutline, OutlineSlide, TeachingSuggestion, ContentSuggestion, ApprovedOutline } from '@/lib/types';
import type { DisciplineConfig } from '@/lib/disciplines/types';
import { THEME_LIST, LAYOUT_LIST } from '@/lib/themes';

interface OutlineReviewProps {
  outline: SlideOutline;
  outlineId: string;
  onApprove: (approved: ApprovedOutline) => void;
  onBack: () => void;
  discipline?: DisciplineConfig;
}

const FALLBACK_STYLE = { bg: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/25', label: 'Other' };

const ACTION_STYLES: Record<ContentSuggestion['action'], string> = {
  add: 'bg-emerald-500/15 text-emerald-400',
  skip: 'bg-rose-500/15 text-rose-400',
  expand: 'bg-blue-500/15 text-blue-400',
};

export default function OutlineReview({ outline, outlineId, onApprove, onBack, discipline }: OutlineReviewProps) {
  const [slides, setSlides] = useState<OutlineSlide[]>(outline.slides);
  const [includeSvg, setIncludeSvg] = useState(true);
  const [quality, setQuality] = useState<'standard' | 'quality'>('standard');
  const [themeId, setThemeId] = useState('dark');
  const [layoutId, setLayoutId] = useState('default');

  const suggestionStyles = useMemo(() => {
    const map: Record<string, { bg: string; label: string }> = {};
    if (discipline) {
      for (const st of discipline.suggestionTypes) {
        map[st.type] = { bg: st.bg, label: st.label };
      }
    }
    return map;
  }, [discipline]);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>(outline.contentSuggestions);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const enabledCount = slides.filter(s => s.enabled).length;

  const toggleSlide = useCallback((slideId: string) => {
    setSlides(prev => prev.map(s =>
      s.id === slideId ? { ...s, enabled: !s.enabled } : s
    ));
  }, []);

  const toggleSuggestion = useCallback((slideId: string, sugId: string) => {
    setSlides(prev => prev.map(s =>
      s.id === slideId
        ? { ...s, suggestions: s.suggestions.map(sg => sg.id === sugId ? { ...sg, accepted: !sg.accepted } : sg) }
        : s
    ));
  }, []);

  const toggleContentSuggestion = useCallback((csId: string) => {
    setContentSuggestions(prev => prev.map(cs =>
      cs.id === csId ? { ...cs, accepted: !cs.accepted } : cs
    ));
  }, []);

  const updateUserNotes = useCallback((slideId: string, notes: string) => {
    setSlides(prev => prev.map(s =>
      s.id === slideId ? { ...s, userNotes: notes } : s
    ));
  }, []);

  const toggleNotesExpanded = useCallback((slideId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(slideId)) next.delete(slideId);
      else next.add(slideId);
      return next;
    });
  }, []);

  const moveSlide = useCallback((slideId: string, direction: 'up' | 'down') => {
    setSlides(prev => {
      const idx = prev.findIndex(s => s.id === slideId);
      if (idx < 0) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      return next.map((s, i) => ({ ...s, slideNumber: i + 1 }));
    });
  }, []);

  const handleApprove = () => {
    onApprove({
      outlineId,
      topic: outline.topic,
      courseLevel: outline.courseLevel,
      extractedText: outline.extractedText,
      slides,
      contentSuggestions,
      includeSvg,
      quality,
      themeId,
      layoutId,
    });
  };

  return (
    <div className="pb-28">
      {/* Summary header */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 mb-6">
        <h2 className="text-lg font-heading font-bold text-zinc-100 mb-1">{outline.topic}</h2>
        <p className="text-zinc-500 text-sm mb-3 leading-relaxed">{outline.summary}</p>
        <div className="flex gap-4 text-sm">
          <span className="text-zinc-600">Level: <span className="text-zinc-300">{outline.courseLevel}</span></span>
          <span className="text-zinc-600">Slides: <span className="text-orange-400 font-medium">{enabledCount} active</span> <span className="text-zinc-700">/ {slides.length} total</span></span>
        </div>
      </div>

      {/* Generation Options */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-heading font-semibold text-zinc-500 uppercase tracking-widest mb-4">Generation Options</h3>
        <div className="flex flex-wrap items-center gap-6">
          {/* SVG toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIncludeSvg(!includeSvg)}
              className={`relative w-9 h-[18px] rounded-full transition-colors flex-shrink-0 ${
                includeSvg ? 'bg-orange-500' : 'bg-zinc-700'
              }`}
              aria-label={includeSvg ? 'Disable SVG diagrams' : 'Enable SVG diagrams'}
            >
              <span
                className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${
                  includeSvg ? 'translate-x-[18px]' : ''
                }`}
              />
            </button>
            <span className="text-sm text-zinc-300">Include SVG diagrams</span>
          </div>

          {/* Quality selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500 mr-1">Quality:</span>
            <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
              <button
                onClick={() => setQuality('standard')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  quality === 'standard'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>Standard</span>
                <span className="block text-[10px] opacity-60">~1 min</span>
              </button>
              <button
                onClick={() => setQuality('quality')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  quality === 'quality'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <span>Quality</span>
                <span className="block text-[10px] opacity-60">~3 min, richer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Theme picker */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-heading font-semibold text-zinc-500 uppercase tracking-widest mb-4">Color Theme</h3>
        <div className="flex flex-wrap gap-2">
          {THEME_LIST.map(t => (
            <button
              key={t.id}
              onClick={() => setThemeId(t.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all text-sm ${
                themeId === t.id
                  ? 'border-orange-500/60 bg-zinc-800 shadow-sm shadow-orange-500/10'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
              }`}
            >
              <div className="flex gap-1">
                <span className={`w-4 h-4 rounded-full ${t.preview.bg}`} />
                <span className={`w-4 h-4 rounded-full ${t.preview.accent}`} />
              </div>
              <span className={`font-medium ${themeId === t.id ? 'text-zinc-100' : 'text-zinc-400'}`}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Layout picker */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-heading font-semibold text-zinc-500 uppercase tracking-widest mb-4">Layout Style</h3>
        <div className="flex flex-wrap gap-2">
          {LAYOUT_LIST.map(l => (
            <button
              key={l.id}
              onClick={() => setLayoutId(l.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all text-sm ${
                layoutId === l.id
                  ? 'border-orange-500/60 bg-zinc-800 shadow-sm shadow-orange-500/10'
                  : 'border-zinc-800 bg-zinc-950 hover:border-zinc-700'
              }`}
            >
              <span className="text-base w-5 text-center">{l.preview.icon}</span>
              <div className="text-left">
                <span className={`font-medium ${layoutId === l.id ? 'text-zinc-100' : 'text-zinc-400'}`}>{l.name}</span>
                <span className={`block text-[10px] ${layoutId === l.id ? 'text-zinc-500' : 'text-zinc-600'}`}>{l.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Slide cards */}
      <div className="space-y-2.5 mb-8">
        <h3 className="text-xs font-heading font-semibold text-zinc-500 uppercase tracking-widest mb-3">Slides</h3>
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`border rounded-xl p-4 transition-all duration-200 ${
              slide.enabled
                ? 'bg-zinc-900/60 border-zinc-800'
                : 'bg-zinc-950/50 border-zinc-900 opacity-35'
            }`}
          >
            {/* Slide header */}
            <div className="flex items-center gap-3 mb-2">
              {/* Toggle */}
              <button
                onClick={() => toggleSlide(slide.id)}
                className={`relative w-9 h-[18px] rounded-full transition-colors flex-shrink-0 ${
                  slide.enabled ? 'bg-orange-500' : 'bg-zinc-700'
                }`}
                aria-label={slide.enabled ? 'Disable slide' : 'Enable slide'}
              >
                <span
                  className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${
                    slide.enabled ? 'translate-x-[18px]' : ''
                  }`}
                />
              </button>

              <span className="text-zinc-600 text-xs font-mono w-5 text-right flex-shrink-0">{slide.slideNumber}</span>
              <span className="text-zinc-200 font-medium text-sm flex-1">{slide.title}</span>

              {/* Reorder arrows */}
              <div className="flex gap-0.5 flex-shrink-0">
                <button
                  onClick={() => moveSlide(slide.id, 'up')}
                  disabled={idx === 0}
                  className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-15 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move up"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button
                  onClick={() => moveSlide(slide.id, 'down')}
                  disabled={idx === slides.length - 1}
                  className="p-1 text-zinc-600 hover:text-zinc-300 disabled:opacity-15 disabled:cursor-not-allowed transition-colors"
                  aria-label="Move down"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
              </div>
            </div>

            {/* Bullets */}
            {slide.enabled && (
              <>
                <ul className="ml-16 text-sm text-zinc-500 space-y-0.5 mb-3">
                  {slide.bullets.map((b, bi) => (
                    <li key={bi} className="flex gap-2">
                      <span className="text-zinc-700 select-none">-</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* Teaching suggestion pills */}
                {slide.suggestions.length > 0 && (
                  <div className="ml-16 flex flex-wrap gap-1.5 mb-3">
                    {slide.suggestions.map(sug => {
                      const style = suggestionStyles[sug.type] || FALLBACK_STYLE;
                      return (
                        <button
                          key={sug.id}
                          onClick={() => toggleSuggestion(slide.id, sug.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] border transition-all ${
                            sug.accepted
                              ? style.bg
                              : 'bg-zinc-900 text-zinc-600 border-zinc-800 line-through'
                          }`}
                          title={sug.text}
                        >
                          <span className="font-semibold">{style.label}</span>
                          <span className="opacity-70 max-w-[180px] truncate">{sug.text}</span>
                          {sug.accepted ? (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                          ) : (
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* User notes */}
                <div className="ml-16">
                  <button
                    onClick={() => toggleNotesExpanded(slide.id)}
                    className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors font-medium"
                  >
                    {expandedNotes.has(slide.id) ? '- Hide notes' : '+ Add notes'}
                  </button>
                  {expandedNotes.has(slide.id) && (
                    <textarea
                      value={slide.userNotes}
                      onChange={e => updateUserNotes(slide.id, e.target.value)}
                      placeholder="Add instructions for this slide..."
                      className="mt-1.5 w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-700 resize-none focus:outline-none transition-all"
                      rows={2}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Content suggestions */}
      {contentSuggestions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xs font-heading font-semibold text-zinc-500 uppercase tracking-widest mb-3">Content Suggestions</h3>
          <div className="space-y-1.5">
            {contentSuggestions.map(cs => (
              <button
                key={cs.id}
                onClick={() => toggleContentSuggestion(cs.id)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  cs.accepted
                    ? 'bg-zinc-900/60 border-zinc-800'
                    : 'bg-zinc-950/50 border-zinc-900 opacity-40'
                }`}
              >
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${ACTION_STYLES[cs.action]}`}>
                  {cs.action}
                </span>
                <span className={`text-sm flex-1 ${cs.accepted ? 'text-zinc-400' : 'text-zinc-600 line-through'}`}>
                  {cs.description}
                </span>
                {cs.accepted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-emerald-400 flex-shrink-0"><path d="M20 6L9 17l-5-5"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-zinc-700 flex-shrink-0"><path d="M18 6L6 18M6 6l12 12"/></svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sticky action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950/95 backdrop-blur-xl border-t border-zinc-800 px-6 py-4 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="py-2.5 px-5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all border border-zinc-700 text-sm"
          >
            Back
          </button>
          <div className="text-sm text-zinc-500 font-medium">
            <span className="text-orange-400">{enabledCount}</span> slide{enabledCount !== 1 ? 's' : ''} selected
          </div>
          <button
            onClick={handleApprove}
            disabled={enabledCount === 0}
            className="py-2.5 px-6 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/20 text-sm"
          >
            Approve & Generate
          </button>
        </div>
      </div>
    </div>
  );
}
