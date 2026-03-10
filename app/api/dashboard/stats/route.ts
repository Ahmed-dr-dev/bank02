import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  const isAdmin = profile?.role === 'admin';
  const isCreditOfficer = profile?.role === 'credit_officer';

  if (isCreditOfficer) {
    const { data: rows, error } = await supabase
      .from('credit_requests')
      .select('id, status, score, score_category, submitted_at, updated_at, amount, client_name, duration');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const list = rows ?? [];
    const total = list.length;
    const pending = list.filter((r) => r.status === 'pending').length;
    const approved = list.filter((r) => r.status === 'approved').length;
    const rejected = list.filter((r) => r.status === 'rejected').length;
    const guarantees = list.filter((r) => r.status === 'guarantees_required').length;
    const processed = approved + rejected + guarantees;
    const approvalRate = processed > 0 ? Math.round((approved / processed) * 1000) / 10 : 0;
    const scores = list.map((r) => r.score).filter((s): s is number => s != null);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10 : 0;
    const high = list.filter((r) => (r.score ?? 0) >= 70).length;
    const medium = list.filter((r) => { const s = r.score ?? 0; return s >= 50 && s < 70; }).length;
    const low = list.filter((r) => (r.score ?? 0) < 50).length;

    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const thisMonth = list.filter((r) => r.submitted_at >= firstOfMonth).length;
    const thisMonthPending = list.filter((r) => r.submitted_at >= firstOfMonth && r.status === 'pending').length;

    const recent = list
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      .slice(0, 10)
      .map((r) => ({ id: r.id, status: r.status, score: r.score, score_category: r.score_category, amount: r.amount, client_name: r.client_name, duration: r.duration, submitted_at: r.submitted_at }));
    const recentPending = list
      .filter((r) => r.status === 'pending')
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      .slice(0, 5)
      .map((r) => ({ id: r.id, status: r.status, score: r.score, score_category: r.score_category, amount: r.amount, client_name: r.client_name, duration: r.duration, submitted_at: r.submitted_at }));
    return NextResponse.json({
      totalRequests: total,
      pendingRequests: pending,
      approvedRequests: approved,
      rejectedRequests: rejected,
      guaranteesRequests: guarantees,
      processedRequests: processed,
      approvalRate,
      averageScore: avgScore,
      thisMonth,
      thisMonthPending,
      scoreDistribution: {
        high: total ? Math.round((high / total) * 1000) / 10 : 0,
        medium: total ? Math.round((medium / total) * 1000) / 10 : 0,
        low: total ? Math.round((low / total) * 1000) / 10 : 0,
        highCount: high,
        mediumCount: medium,
        lowCount: low,
      },
      recentRequests: recent,
      recentPending,
      role: 'credit_officer',
    });
  }

  if (isAdmin) {
    const { data: rows, error } = await supabase.from('credit_requests').select('id, status, score, score_category, submitted_at, amount, client_name, duration');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const list = rows ?? [];
    const total = list.length;
    const approved = list.filter((r) => r.status === 'approved').length;
    const pending = list.filter((r) => r.status === 'pending').length;
    const rejected = list.filter((r) => r.status === 'rejected').length;
    const guarantees = list.filter((r) => r.status === 'guarantees_required').length;
    const scores = list.map((r) => r.score).filter((s): s is number => s != null);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const high = list.filter((r) => (r.score ?? 0) >= 70).length;
    const medium = list.filter((r) => { const s = r.score ?? 0; return s >= 50 && s < 70; }).length;
    const low = list.filter((r) => (r.score ?? 0) < 50).length;
    const recent = list
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
      .slice(0, 5)
      .map((r) => ({ id: r.id, status: r.status, score: r.score, score_category: r.score_category, amount: r.amount, submitted_at: r.submitted_at, client_name: r.client_name, duration: r.duration }));
    return NextResponse.json({
      totalRequests: total,
      approvalRate: total ? Math.round((approved / total) * 1000) / 10 : 0,
      averageScore: Math.round(avgScore * 10) / 10,
      pendingRequests: pending,
      statusCounts: { approved, pending, rejected, guarantees_required: guarantees },
      scoreDistribution: {
        high: total ? Math.round((high / total) * 1000) / 10 : 0,
        medium: total ? Math.round((medium / total) * 1000) / 10 : 0,
        low: total ? Math.round((low / total) * 1000) / 10 : 0,
        highCount: high,
        mediumCount: medium,
        lowCount: low,
      },
      recentRequests: recent,
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
