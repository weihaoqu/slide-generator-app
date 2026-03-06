import { cookies } from 'next/headers';

const FEEDBACK_PASSWORD = process.env.FEEDBACK_PASSWORD || 'changeme';
const COOKIE_NAME = 'feedback_auth';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours

export async function POST(req: Request) {
  const { password } = await req.json();

  if (password !== FEEDBACK_PASSWORD) {
    return Response.json({ error: 'Invalid password' }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    maxAge: COOKIE_MAX_AGE,
    path: '/',
    sameSite: 'lax',
  });

  return Response.json({ ok: true });
}
