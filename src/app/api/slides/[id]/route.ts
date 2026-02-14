import { NextRequest } from 'next/server';
import { getSlideHtml, getSlideMetadata } from '@/lib/storage';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Sanitize ID to prevent path traversal
  if (!/^[a-f0-9-]+$/.test(id)) {
    return new Response('Invalid ID', { status: 400 });
  }

  const html = await getSlideHtml(id);
  if (!html) {
    return new Response('Not found', { status: 404 });
  }

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

export async function HEAD(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meta = await getSlideMetadata(id);
  if (!meta) {
    return new Response(null, { status: 404 });
  }
  return new Response(null, {
    headers: {
      'Content-Type': 'text/html',
      'X-Slide-Count': String(meta.slideCount),
      'X-Title': meta.title,
    },
  });
}
