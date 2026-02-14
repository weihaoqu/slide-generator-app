import { NextRequest } from 'next/server';
import { getProgress } from '@/lib/progress';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const progress = getProgress(id);

  console.log('[generate-status]', id.slice(0, 8), progress?.status ?? 'NOT FOUND', progress?.currentSlide ?? '-');

  if (!progress) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(progress, {
    headers: { 'Cache-Control': 'no-cache' },
  });
}
