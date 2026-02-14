'use client';

import Link from 'next/link';
import { SlideMetadata } from '@/lib/types';
import { getDiscipline } from '@/lib/disciplines';

interface GalleryCardProps {
  slide: SlideMetadata;
}

export default function GalleryCard({ slide }: GalleryCardProps) {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <Link
      href={`/preview/${slide.id}`}
      className="group relative block bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all duration-200 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative">
        <h3 className="font-heading font-semibold text-zinc-200 group-hover:text-zinc-100 truncate mb-2.5 text-[15px]">
          {slide.title}
        </h3>
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="px-2 py-0.5 bg-zinc-800 rounded-md text-[11px] text-zinc-400 font-medium">
            {slide.slideCount} slides
          </span>
          <span className="px-2 py-0.5 bg-zinc-800 rounded-md text-[11px] text-zinc-400 font-medium">
            {formatSize(slide.fileSize)}
          </span>
          <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
            slide.source === 'upload'
              ? 'bg-orange-500/10 text-orange-400'
              : 'bg-amber-500/10 text-amber-400'
          }`}>
            {slide.source === 'upload' ? 'Upload' : 'Topic'}
          </span>
          {slide.disciplineId && (() => {
            const d = getDiscipline(slide.disciplineId);
            return (
              <span className="px-2 py-0.5 bg-violet-500/10 rounded-md text-[11px] text-violet-400 font-medium">
                {d.icon} {d.name}
              </span>
            );
          })()}
        </div>
        {slide.courseLevel && (
          <p className="text-xs text-zinc-600 mb-1">{slide.courseLevel}</p>
        )}
        <p className="text-xs text-zinc-600">{formatDate(slide.createdAt)}</p>
      </div>
    </Link>
  );
}
