import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';
import { logActivity } from '@/lib/activityLog';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const role = body.role;
  if (!role || !['client', 'admin', 'credit_officer'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const { data: target } = await supabase.from('profiles').select('id, email, role').eq('id', id).single();
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (target.id === profileId) return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });

  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logActivity({
    userId: profileId,
    action: 'user_role_updated',
    entityType: 'profile',
    entityId: id,
    details: { email: target.email, previousRole: target.role, newRole: role },
  });

  return NextResponse.json(data);
}
