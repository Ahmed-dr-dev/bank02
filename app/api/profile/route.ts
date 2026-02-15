import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase.from('profiles').select('*').eq('id', profileId).single();

  if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const out = { ...data };
  delete (out as Record<string, unknown>)['password_hash'];
  return NextResponse.json(out);
}

export async function PATCH(request: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const allowed = ['full_name', 'email', 'phone', 'date_of_birth', 'cin', 'address', 'city', 'postal_code', 'country', 'profession', 'employer', 'years_experience', 'monthly_income'];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  allowed.forEach((key) => {
    if (body[key] !== undefined) updates[key] = body[key];
  });
  delete updates.password_hash;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const out = { ...data };
  delete (out as Record<string, unknown>)['password_hash'];
  return NextResponse.json(out);
}
