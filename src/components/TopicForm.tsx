'use client';

import { useState } from 'react';
import type { DisciplineConfig } from '@/lib/disciplines/types';

interface TopicFormProps {
  onSubmit: (data: {
    topic: string;
    courseLevel: string;
    slideCount: number;
    notes: string;
  }) => void;
  disabled?: boolean;
  discipline?: DisciplineConfig;
}

const COURSE_LEVELS = [
  'Introductory',
  'Intermediate',
  'Advanced',
  'Graduate',
];

const DURATION_PRESETS = [
  { label: '15 min', minutes: 15, slides: 5 },
  { label: '30 min', minutes: 30, slides: 10 },
  { label: '50 min', minutes: 50, slides: 17 },
  { label: '75 min', minutes: 75, slides: 25 },
];

export default function TopicForm({ onSubmit, disabled, discipline }: TopicFormProps) {
  const [topic, setTopic] = useState('');
  const [courseLevel, setCourseLevel] = useState('Introductory');
  const [duration, setDuration] = useState(50);
  const [notes, setNotes] = useState('');

  const slideCount = Math.round(duration / 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit({ topic: topic.trim(), courseLevel, slideCount, notes: notes.trim() });
    }
  };

  const inputClass = "w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none transition-all duration-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Topic
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={discipline?.exampleTopics?.length
            ? `e.g., ${discipline.exampleTopics.join(', ')}`
            : "e.g., Binary Search Trees, TCP/IP Protocol, OCaml Pattern Matching"
          }
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Course Level
        </label>
        <select
          value={courseLevel}
          onChange={(e) => setCourseLevel(e.target.value)}
          className={inputClass}
        >
          {COURSE_LEVELS.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Lecture Duration
        </label>
        <div className="grid grid-cols-4 gap-2">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.minutes}
              type="button"
              onClick={() => setDuration(preset.minutes)}
              className={`py-3 px-2 rounded-xl text-center transition-all duration-200 border ${
                duration === preset.minutes
                  ? 'bg-orange-500/15 border-orange-500/50 text-orange-300'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }`}
            >
              <div className="text-sm font-semibold">{preset.label}</div>
              <div className="text-xs mt-0.5 opacity-70">~{preset.slides} slides</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Additional notes <span className="text-zinc-600">(optional)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Focus areas, specific examples to include, things to emphasize..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={!topic.trim() || disabled}
        className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
      >
        Generate Slides
      </button>
    </form>
  );
}
