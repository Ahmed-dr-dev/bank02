import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';
import { logActivity } from '@/lib/activityLog';

const THRESHOLDS_KEY = 'thresholds';

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data, error } = await supabase.from('scoring_config').select('key, value').in('key', [THRESHOLDS_KEY, 'highScoreMin', 'mediumScoreMin']);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const map = new Map((data ?? []).map((r) => [r.key, r.value]));
  const thresholds = (map.get(THRESHOLDS_KEY) as Record<string, number>) ?? { minApprovalScore: 70, maxDebtRatioPercent: 40, interestRatePercent: 4.5 };
  return NextResponse.json({
    minApprovalScore: thresholds.minApprovalScore ?? 70,
    maxDebtRatioPercent: thresholds.maxDebtRatioPercent ?? 40,
    interestRatePercent: thresholds.interestRatePercent ?? 4.5,
    highScoreMin: Number(map.get('highScoreMin')) || 70,
    mediumScoreMin: Number(map.get('mediumScoreMin')) || 50,
  });
}

export async function PUT(request: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const minApprovalScore = body.minApprovalScore != null ? Number(body.minApprovalScore) : undefined;
  const maxDebtRatioPercent = body.maxDebtRatioPercent != null ? Number(body.maxDebtRatioPercent) : undefined;
  const interestRatePercent = body.interestRatePercent != null ? Number(body.interestRatePercent) : undefined;
  const highScoreMin = body.highScoreMin != null ? Number(body.highScoreMin) : undefined;
  const mediumScoreMin = body.mediumScoreMin != null ? Number(body.mediumScoreMin) : undefined;

  const updates: Array<{ key: string; value: unknown }> = [];
  if (minApprovalScore != null || maxDebtRatioPercent != null || interestRatePercent != null) {
    const { data: existing } = await supabase.from('scoring_config').select('value').eq('key', THRESHOLDS_KEY).single();
    const current = (existing?.value as Record<string, number>) ?? {};
    updates.push({
      key: THRESHOLDS_KEY,
      value: {
        minApprovalScore: minApprovalScore ?? current.minApprovalScore ?? 70,
        maxDebtRatioPercent: maxDebtRatioPercent ?? current.maxDebtRatioPercent ?? 40,
        interestRatePercent: interestRatePercent ?? current.interestRatePercent ?? 4.5,
      },
    });
  }
  if (highScoreMin != null) updates.push({ key: 'highScoreMin', value: highScoreMin });
  if (mediumScoreMin != null) updates.push({ key: 'mediumScoreMin', value: mediumScoreMin });

  for (const u of updates) {
    const { error: err } = await supabase.from('scoring_config').upsert({ key: u.key, value: u.value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (err) return NextResponse.json({ error: err.message }, { status: 500 });
  }

  await logActivity({
    userId: profileId,
    action: 'scoring_config_updated',
    entityType: 'scoring_config',
    details: body,
  });

  return NextResponse.json({ ok: true });
}
