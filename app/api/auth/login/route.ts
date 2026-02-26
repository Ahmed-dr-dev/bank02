import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId, setProfileIdCookie } from '@/lib/session';
import { logActivity } from '@/lib/activityLog';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('id, password_hash, role')
    .eq('email', String(email).trim().toLowerCase())
    .single();

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'E-mail ou mot de passe incorrect' }, { status: 401 });
  }

  const ok = await bcrypt.compare(String(password), profile.password_hash);
  if (!ok) {
    return NextResponse.json({ error: 'E-mail ou mot de passe incorrect' }, { status: 401 });
  }

  await logActivity({ userId: profile.id, action: 'login', entityType: 'profile', entityId: profile.id });
  const res = NextResponse.json({ ok: true, role: profile.role ?? 'client' });
  res.headers.set('Set-Cookie', setProfileIdCookie(profile.id));
  return res;
}

export async function GET() {
  const profileId = await getSessionProfileId();
  return NextResponse.json({ loggedIn: !!profileId });
}
