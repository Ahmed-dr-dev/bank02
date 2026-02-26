import { NextResponse } from 'next/server';
import { clearProfileIdCookie } from '@/lib/session';

function logoutResponse() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', clearProfileIdCookie());
  return res;
}

export async function POST() {
  return logoutResponse();
}

export async function GET(request: Request) {
  const origin = request.headers.get('origin') ?? request.url.split('/').slice(0, 3).join('/');
  const res = NextResponse.redirect(new URL('/login', origin));
  res.headers.set('Set-Cookie', clearProfileIdCookie());
  return res;
}
