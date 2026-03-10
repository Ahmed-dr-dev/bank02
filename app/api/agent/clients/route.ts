import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin' && profile?.role !== 'credit_officer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: clients, error: clientsErr } = await supabase
    .from('profiles')
    .select('id, email, full_name, created_at')
    .eq('role', 'client')
    .order('created_at', { ascending: false });
  if (clientsErr) return NextResponse.json({ error: clientsErr.message }, { status: 500 });

  const { data: requests, error: reqErr } = await supabase
    .from('credit_requests')
    .select('user_id, status, amount, score, submitted_at');
  if (reqErr) return NextResponse.json({ error: reqErr.message }, { status: 500 });

  const reqList = requests ?? [];
  const byUser: Record<string, typeof reqList> = {};
  for (const r of reqList) {
    if (!byUser[r.user_id]) byUser[r.user_id] = [];
    byUser[r.user_id].push(r);
  }

  const result = (clients ?? []).map((c) => {
    const reqs = byUser[c.id] ?? [];
    return {
      id: c.id,
      email: c.email,
      full_name: c.full_name,
      created_at: c.created_at,
      totalRequests: reqs.length,
      pendingRequests: reqs.filter((r) => r.status === 'pending').length,
      approvedRequests: reqs.filter((r) => r.status === 'approved').length,
      rejectedRequests: reqs.filter((r) => r.status === 'rejected').length,
      totalAmount: reqs.reduce((s, r) => s + Number(r.amount || 0), 0),
      lastRequest: reqs.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())[0] ?? null,
    };
  });

  return NextResponse.json({ clients: result });
}
