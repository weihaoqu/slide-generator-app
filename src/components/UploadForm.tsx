'use client';

import { useState, useCallback } from 'react';

interface UploadFormProps {
  onSubmit: (file: File, slideCount: number) => void;
  disabled?: boolean;
}

const DURATION_PRESETS = [
  { label: '15 min', minutes: 15, slides: 5 },
  { label: '30 min', minutes: 30, slides: 10 },
  { label: '50 min', minutes: 50, slides: 17 },
  { label: '75 min', minutes: 75, slides: 25 },
];

export default function UploadForm({ onSubmit, disabled }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(50);
  const slideCount = Math.round(duration / 3);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.name.endsWith('.pptx') || f.name.endsWith('.pdf')) {
      setFile(f);
    } else {
      alert('Please upload a .pptx or .pdf file');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) onSubmit(file, slideCount);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
          dragOver
            ? 'border-orange-400 bg-orange-500/5'
            : file
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-zinc-700 hover:border-zinc-600 bg-zinc-900/50'
        }`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pptx,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {file ? (
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <p className="text-base font-semibold text-emerald-400">{file.name}</p>
            <p className="text-sm text-zinc-500 mt-1">{formatSize(file.size)}</p>
            <p className="text-xs text-zinc-600 mt-3">Click or drag to replace</p>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                <path d="M14 2v6h6" />
                <path d="M12 18v-6" />
                <path d="m9 15 3-3 3 3" />
              </svg>
            </div>
            <p className="text-base text-zinc-300 font-medium">Drop your PPTX or PDF here</p>
            <p className="text-sm text-zinc-600 mt-1">or click to browse</p>
          </div>
        )}
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

      <button
        type="submit"
        disabled={!file || disabled}
        className="w-full py-3 px-6 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-600/20 hover:shadow-orange-500/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"
      >
        Generate Slides
      </button>
    </form>
  );
}
