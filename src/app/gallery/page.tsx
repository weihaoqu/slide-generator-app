import Link from 'next/link';
import { listSlides } from '@/lib/storage';
import GalleryCard from '@/components/GalleryCard';

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const slides = await listSlides();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-100">Gallery</h1>
          <p className="text-zinc-500 mt-1 text-sm">Recently generated slide decks</p>
        </div>
        <Link
          href="/generate"
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-orange-600/20"
        >
          Generate New
        </Link>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <p className="text-zinc-400 text-lg font-heading font-semibold">No slide decks yet</p>
          <p className="text-zinc-600 mt-1 text-sm">Generate your first deck to see it here</p>
          <Link
            href="/generate"
            className="inline-block mt-6 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium rounded-xl transition-all border border-zinc-700 text-sm"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide) => (
            <GalleryCard key={slide.id} slide={slide} />
          ))}
        </div>
      )}
    </div>
  );
}
