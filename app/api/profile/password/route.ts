import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';
import { logActivity } from '@/lib/activityLog';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const currentPassword = body.currentPassword;
  const newPassword = body.newPassword;

  if (currentPassword == null || newPassword == null || String(currentPassword) === '' || String(newPassword) === '') {
    return NextResponse.json({ error: 'Mot de passe actuel et nouveau mot de passe requis' }, { status: 400 });
  }
  if (String(newPassword).length < 6) {
    return NextResponse.json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' }, { status: 400 });
  }
  if (String(currentPassword) === String(newPassword)) {
    return NextResponse.json({ error: 'Le nouveau mot de passe doit être différent de l’actuel' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase.from('profiles').select('password_hash').eq('id', profileId).single();

  if (error || !row) {
    return NextResponse.json({ error: 'Impossible de vérifier le compte' }, { status: 500 });
  }
  const hash = row.password_hash as string | null;
  if (!hash) {
    return NextResponse.json({ error: 'Compte sans mot de passe configuré' }, { status: 400 });
  }

  const ok = await bcrypt.compare(String(currentPassword), hash);
  if (!ok) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 });
  }

  const password_hash = await bcrypt.hash(String(newPassword), 10);
  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ password_hash, updated_at: new Date().toISOString() })
    .eq('id', profileId);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  await logActivity({
    userId: profileId,
    action: 'password_changed',
    entityType: 'profile',
    entityId: profileId,
  });

  return NextResponse.json({ ok: true });
}
