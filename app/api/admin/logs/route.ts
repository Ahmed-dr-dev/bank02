import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

export async function GET(request: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') ?? '50', 10)));
  const offset = (page - 1) * limit;
  const action = searchParams.get('action') || undefined;

  let query = supabase
    .from('activity_logs')
    .select('id, user_id, action, entity_type, entity_id, details, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (action) query = query.eq('action', action);

  const { data: rows, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const userIds = [...new Set((rows ?? []).map((r) => r.user_id).filter(Boolean))] as string[];
  const { data: profiles } = userIds.length
    ? await supabase.from('profiles').select('id, email, full_name').in('id', userIds)
    : { data: [] };
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  const logs = (rows ?? []).map((r) => ({
    id: r.id,
    user_id: r.user_id,
    user_email: r.user_id ? profileMap.get(r.user_id)?.email : null,
    user_name: r.user_id ? profileMap.get(r.user_id)?.full_name : null,
    action: r.action,
    entity_type: r.entity_type,
    entity_id: r.entity_id,
    details: r.details,
    created_at: r.created_at,
  }));

  return NextResponse.json({ logs, total: count ?? 0, page, limit });
}
