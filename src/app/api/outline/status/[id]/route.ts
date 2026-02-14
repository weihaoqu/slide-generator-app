import { NextRequest } from 'next/server';
import { getOutlineProgress } from '@/lib/progress';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const progress = getOutlineProgress(id);

  if (!progress) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(progress, {
    headers: { 'Cache-Control': 'no-cache' },
  });
}
