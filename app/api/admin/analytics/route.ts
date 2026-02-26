import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data: rows, error } = await supabase
    .from('credit_requests')
    .select('id, user_id, status, score, amount, profession, credit_purpose, submitted_at, updated_at');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const list = rows ?? [];

  const now = new Date();
  const last6Months: { month: string; monthLabel: string; year: number; requests: number; approved: number; rejected: number; pending: number; guarantees: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const monthLabel = `${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
    const inMonth = list.filter((r) => {
      const t = new Date(r.submitted_at).getTime();
      return t >= d.getTime() && t < next.getTime();
    });
    last6Months.push({
      month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      monthLabel,
      year: d.getFullYear(),
      requests: inMonth.length,
      approved: inMonth.filter((r) => r.status === 'approved').length,
      rejected: inMonth.filter((r) => r.status === 'rejected').length,
      pending: inMonth.filter((r) => r.status === 'pending').length,
      guarantees: inMonth.filter((r) => r.status === 'guarantees_required').length,
    });
  }

  const totalVolume = list.reduce((sum, r) => sum + Number(r.amount || 0), 0);
  const uniqueClients = new Set(list.map((r) => r.user_id)).size;

  const professionCount: Record<string, number> = {};
  list.forEach((r) => {
    const p = (r.profession || 'Non renseigné').trim() || 'Non renseigné';
    professionCount[p] = (professionCount[p] ?? 0) + 1;
  });
  const topProfessions = Object.entries(professionCount)
    .map(([profession, count]) => ({ profession, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const purposeMap: Record<string, { count: number; total: number }> = {};
  list.forEach((r) => {
    const p = (r.credit_purpose || 'Non renseigné').trim() || 'Non renseigné';
    if (!purposeMap[p]) purposeMap[p] = { count: 0, total: 0 };
    purposeMap[p].count += 1;
    purposeMap[p].total += Number(r.amount || 0);
  });
  const amountByPurpose = Object.entries(purposeMap)
    .map(([purpose, { count, total }]) => ({ purpose, count, totalAmount: total, avgAmount: count ? total / count : 0 }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10);

  const resolved = list.filter((r) => r.status !== 'pending');
  const avgProcessingDays =
    resolved.length
      ? resolved.reduce((sum, r) => {
          const sub = new Date(r.submitted_at).getTime();
          const up = new Date(r.updated_at).getTime();
          return sum + (up - sub) / (1000 * 60 * 60 * 24);
        }, 0) / resolved.length
      : null;

  const scoreDistributionByMonth = last6Months.map((m) => {
    const inMonth = list.filter((r) => {
      const d = new Date(r.submitted_at);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` === m.month;
    });
    const high = inMonth.filter((r) => (r.score ?? 0) >= 70).length;
    const medium = inMonth.filter((r) => { const s = r.score ?? 0; return s >= 50 && s < 70; }).length;
    const low = inMonth.filter((r) => (r.score ?? 0) < 50).length;
    const scores = inMonth.map((r) => r.score).filter((s): s is number => s != null);
    const avgScore = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return { month: m.monthLabel, high, medium, low, avgScore: Math.round(avgScore * 10) / 10 };
  });

  return NextResponse.json({
    monthlyTrend: last6Months,
    totalVolume,
    uniqueClients,
    totalRequests: list.length,
    avgProcessingDays: avgProcessingDays != null ? Math.round(avgProcessingDays * 10) / 10 : null,
    topProfessions,
    amountByPurpose,
    scoreDistributionByMonth,
  });
}
