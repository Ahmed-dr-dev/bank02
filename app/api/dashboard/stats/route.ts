import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  const isAdmin = profile?.role === 'admin';

  if (isAdmin) {
    const { data: rows, error } = await supabase.from('credit_requests').select('status, score');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const total = rows?.length ?? 0;
    const approved = rows?.filter((r) => r.status === 'approved').length ?? 0;
    const pending = rows?.filter((r) => r.status === 'pending').length ?? 0;
    const scores = (rows ?? []).map((r) => r.score).filter((s): s is number => s != null);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return NextResponse.json({
      totalRequests: total,
      approvalRate: total ? Math.round((approved / total) * 1000) / 10 : 0,
      averageScore: Math.round(avgScore * 10) / 10,
      pendingRequests: pending,
    });
  }

  const { data: rows, error } = await supabase
    .from('credit_requests')
    .select('status')
    .eq('user_id', profileId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const list = rows ?? [];
  return NextResponse.json({
    totalRequests: list.length,
    approvedRequests: list.filter((r) => r.status === 'approved').length,
    activeRequests: list.filter((r) => r.status === 'pending' || r.status === 'guarantees_required').length,
  });
}
