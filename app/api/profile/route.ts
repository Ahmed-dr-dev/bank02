import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';
import { isValidTunisianIban, isValidTunisianRib, normalizeIban, normalizeRib } from '@/lib/bankIdentifiers';

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
  const allowed = [
    'full_name',
    'email',
    'phone',
    'date_of_birth',
    'cin',
    'address',
    'city',
    'postal_code',
    'country',
    'profession',
    'employer',
    'years_experience',
    'monthly_income',
    'rib',
    'iban',
  ];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (body.rib !== undefined) {
    const r = normalizeRib(String(body.rib));
    if (!isValidTunisianRib(r)) {
      return NextResponse.json({ error: 'RIB invalide : 20 chiffres requis' }, { status: 400 });
    }
    updates.rib = r;
  }
  if (body.iban !== undefined) {
    const ib = normalizeIban(String(body.iban));
    if (!isValidTunisianIban(ib)) {
      return NextResponse.json({ error: 'IBAN invalide : format tunisien attendu (TN + 22 caractères)' }, { status: 400 });
    }
    updates.iban = ib;
  }

  for (const key of allowed) {
    if (key === 'rib' || key === 'iban') continue;
    if (body[key] !== undefined) updates[key] = body[key];
  }
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
