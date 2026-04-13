import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { setProfileIdCookie } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = body.email?.trim()?.toLowerCase();
  const password = body.password;
  const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ') || body.full_name || '';

  if (!email || !password) {
    return NextResponse.json({ error: 'E-mail et mot de passe requis' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
  }

  const password_hash = await bcrypt.hash(String(password), 10);
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      email,
      password_hash,
      full_name: fullName || null,
      phone: body.phone || null,
      role: 'client',
      cin: body.cin || null,
      date_of_birth: body.date_of_birth || null,
      address: body.address || null,
      city: body.city || null,
      postal_code: body.postal_code || null,
      country: body.country || 'Tunisie',
      profession: body.profession || null,
      employer: body.employer || null,
      years_experience: body.years_experience != null ? Number(body.years_experience) : null,
      monthly_income: body.monthly_income != null ? Number(body.monthly_income) : null,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const res = NextResponse.json({ ok: true, profile: { id: profile.id } });
  res.headers.set('Set-Cookie', setProfileIdCookie(profile.id));
  return res;
}
