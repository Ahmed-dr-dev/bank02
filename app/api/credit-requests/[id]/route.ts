import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';
import { logActivity } from '@/lib/activityLog';
import { dbRowToCreditRequest } from '@/lib/db';
import { scoreAndCategoryForDb } from '@/lib/creditScoring';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { id } = await params;
  const { data, error } = await supabase.from('credit_requests').select('*').eq('id', id).single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (data.user_id !== profileId) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
    if (profile?.role !== 'admin' && profile?.role !== 'credit_officer') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json(dbRowToCreditRequest(data as Parameters<typeof dbRowToCreditRequest>[0]));
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { id } = await params;
  const { data: existing, error: fetchErr } = await supabase.from('credit_requests').select('*').eq('id', id).single();
  if (fetchErr || !existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  const canChangeStatus = profile?.role === 'admin' || profile?.role === 'credit_officer';
  const isOwner = existing.user_id === profileId;

  const body = await request.json();

  if (canChangeStatus && (body.status !== undefined || body.notes !== undefined)) {
    const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) {
      if (!['pending', 'approved', 'rejected', 'guarantees_required'].includes(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updatePayload.status = body.status;
    }
    if (body.notes !== undefined) updatePayload.notes = body.notes;
    const { data, error } = await supabase
      .from('credit_requests')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity({
      userId: profileId,
      action: 'request_updated',
      entityType: 'credit_request',
      entityId: id,
      details: { previousStatus: existing.status, newStatus: body.status ?? existing.status, notesUpdated: body.notes !== undefined },
    });
    return NextResponse.json(dbRowToCreditRequest(data as Parameters<typeof dbRowToCreditRequest>[0]));
  }

  if (isOwner && existing.status === 'pending') {
    const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ') || existing.client_name;
    const monthlyIncome = body.monthlyIncome != null ? Number(body.monthlyIncome) : existing.monthly_income;
    const creditRaw = body.creditAmount;
    const parsedAmount =
      creditRaw !== undefined && creditRaw !== null && String(creditRaw).trim() !== '' ? Number(creditRaw) : NaN;
    const amount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : existing.amount;
    const durationRaw = body.duration;
    const parsedDuration =
      durationRaw !== undefined && durationRaw !== null && String(durationRaw).trim() !== '' ? Number(durationRaw) : NaN;
    const duration = Number.isFinite(parsedDuration) && parsedDuration > 0 ? parsedDuration : existing.duration;
    const additionalIncome = body.additionalIncome != null ? Number(body.additionalIncome) : existing.additional_income;
    const rentMortgage = body.rentMortgage != null ? Number(body.rentMortgage) : existing.rent_mortgage;
    const otherCharges = body.otherCharges != null ? Number(body.otherCharges) : existing.other_charges;
    const loanPayment = body.loanPayment != null ? Number(body.loanPayment) : existing.loan_payment;

    const { score, score_category } = scoreAndCategoryForDb({
      monthly_income: monthlyIncome,
      additional_income: additionalIncome,
      rent_mortgage: rentMortgage,
      other_charges: otherCharges,
      loan_payment: loanPayment,
      amount,
      duration,
    });

    const updatePayload = {
      updated_at: new Date().toISOString(),
      client_name: fullName,
      client_email: body.email ?? existing.client_email,
      amount,
      duration,
      monthly_income: monthlyIncome,
      profession: body.profession ?? existing.profession,
      employment_status: body.employmentStatus ?? existing.employment_status,
      employer: body.employer ?? existing.employer,
      years_experience: body.yearsExperience != null ? Number(body.yearsExperience) : existing.years_experience,
      work_address: body.workAddress ?? existing.work_address,
      additional_income: additionalIncome,
      rent_mortgage: rentMortgage,
      other_charges: otherCharges,
      existing_loans: body.existingLoans ?? existing.existing_loans,
      loan_payment: loanPayment,
      credit_purpose: body.creditPurpose ?? existing.credit_purpose,
      guarantee_type: body.guaranteeType ?? existing.guarantee_type,
      notes: body.notes ?? existing.notes,
      score,
      score_category,
    };
    const { data, error } = await supabase.from('credit_requests').update(updatePayload).eq('id', id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(dbRowToCreditRequest(data as Parameters<typeof dbRowToCreditRequest>[0]));
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { id } = await params;
  const { data: existing, error: fetchErr } = await supabase.from('credit_requests').select('id, user_id, status').eq('id', id).single();
  if (fetchErr || !existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (existing.user_id !== profileId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (existing.status !== 'pending') return NextResponse.json({ error: 'Seules les demandes en attente peuvent être supprimées' }, { status: 400 });

  const { error } = await supabase.from('credit_requests').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
