'use client';

interface SlidePreviewProps {
  slideId: string;
  className?: string;
}

export default function SlidePreview({ slideId, className = '' }: SlidePreviewProps) {
  return (
    <iframe
      src={`/api/slides/${slideId}`}
      className={`w-full border border-zinc-800 rounded-xl bg-zinc-950 ${className}`}
      style={{ minHeight: '70vh' }}
      title="Slide Preview"
    />
  );
}
