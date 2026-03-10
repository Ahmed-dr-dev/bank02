import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';
import { logActivity } from '@/lib/activityLog';
import bcrypt from 'bcryptjs';

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ users: data ?? [] });
}

export async function POST(request: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const email = body.email?.trim()?.toLowerCase();
  const password = body.password;
  const fullName = body.full_name?.trim() || body.fullName?.trim() || '';
  const role = body.role === 'credit_officer' ? 'credit_officer' : 'client';

  if (!email || !password) return NextResponse.json({ error: 'E-mail et mot de passe requis' }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, { status: 400 });

  const password_hash = await bcrypt.hash(String(password), 10);
  const { data: newUser, error } = await supabase
    .from('profiles')
    .insert({ email, password_hash, full_name: fullName || null, role })
    .select('id, email, full_name, role, created_at')
    .single();

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Un compte existe déjà avec cet e-mail' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logActivity({
    userId: profileId,
    action: 'user_role_updated',
    entityType: 'profile',
    entityId: newUser.id,
    details: { email: newUser.email, newRole: role, createdByAdmin: true },
  });
  return NextResponse.json(newUser);
}
