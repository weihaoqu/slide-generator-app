import { notFound } from 'next/navigation';
import { getSlideMetadata } from '@/lib/storage';
import SlidePreview from '@/components/SlidePreview';

interface PreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = await params;

  if (!/^[a-f0-9-]+$/.test(id)) {
    notFound();
  }

  const metadata = await getSlideMetadata(id);
  if (!metadata) {
    notFound();
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-zinc-100">{metadata.title}</h1>
          <div className="flex gap-3 mt-2 text-sm text-zinc-500">
            <span>{metadata.slideCount} slides</span>
            <span className="text-zinc-700">&middot;</span>
            <span>{formatSize(metadata.fileSize)}</span>
            <span className="text-zinc-700">&middot;</span>
            <span>{metadata.source === 'upload' ? 'From upload' : 'From topic'}</span>
            {metadata.courseLevel && (
              <>
                <span className="text-zinc-700">&middot;</span>
                <span>{metadata.courseLevel}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <a
            href={`/api/slides/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-lg transition-all border border-zinc-700"
          >
            Open in new tab
          </a>
          <a
            href={`/api/slides/${id}`}
            download={`${metadata.title.replace(/[^a-zA-Z0-9-_ ]/g, '')}.html`}
            className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-orange-600/20"
          >
            Download
          </a>
        </div>
      </div>

      {/* Preview iframe */}
      <SlidePreview slideId={id} />
    </div>
  );
}
