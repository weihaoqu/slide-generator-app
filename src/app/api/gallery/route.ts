import { listSlides } from '@/lib/storage';

export async function GET() {
  const slides = await listSlides();
  return Response.json(slides);
}
