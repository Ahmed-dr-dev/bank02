import { NextResponse } from 'next/server';
import { clearProfileIdCookie } from '@/lib/session';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', clearProfileIdCookie());
  return res;
}
