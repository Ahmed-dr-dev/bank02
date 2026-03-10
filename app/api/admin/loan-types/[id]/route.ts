import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

async function requireAdmin() {
  const profileId = await getSessionProfileId();
  if (!profileId) return null;
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin') return null;
  return supabase;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updatePayload.name = String(body.name).trim();
  if (body.description !== undefined) updatePayload.description = body.description?.trim() || null;
  if (body.min_amount !== undefined) updatePayload.min_amount = Number(body.min_amount);
  if (body.max_amount !== undefined) updatePayload.max_amount = Number(body.max_amount);
  if (body.min_duration_months !== undefined) updatePayload.min_duration_months = parseInt(body.min_duration_months);
  if (body.max_duration_months !== undefined) updatePayload.max_duration_months = parseInt(body.max_duration_months);
  if (body.interest_rate_percent !== undefined) updatePayload.interest_rate_percent = Number(body.interest_rate_percent);
  if (body.max_debt_ratio_percent !== undefined) updatePayload.max_debt_ratio_percent = Number(body.max_debt_ratio_percent);
  if (body.required_documents !== undefined) updatePayload.required_documents = Array.isArray(body.required_documents) ? body.required_documents : [];
  if (body.active !== undefined) updatePayload.active = Boolean(body.active);

  const { data, error } = await supabase
    .from('loan_types')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await params;
  const { error } = await supabase.from('loan_types').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
