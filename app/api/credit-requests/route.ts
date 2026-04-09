import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';
import { logActivity } from '@/lib/activityLog';
import { dbRowToCreditRequest } from '@/lib/db';
import { scoreAndCategoryForDb } from '@/lib/creditScoring';

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  const canSeeAll = profile?.role === 'admin' || profile?.role === 'credit_officer';

  let query = supabase.from('credit_requests').select('*').order('submitted_at', { ascending: false });
  if (!canSeeAll) query = query.eq('user_id', profileId);
  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const requests = (data ?? []).map((row) => dbRowToCreditRequest(row as Parameters<typeof dbRowToCreditRequest>[0]));
  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('full_name, email').eq('id', profileId).single();

  const body = await request.json();
  const fullName = [body.firstName, body.lastName].filter(Boolean).join(' ') || profile?.full_name || 'Client';
  const email = body.email || profile?.email || '';

  const monthlyIncome = body.monthlyIncome ? Number(body.monthlyIncome) : null;
  const amount = Number(body.creditAmount) || 0;
  const duration = Number(body.duration) || 0;
  const additionalIncome = body.additionalIncome ? Number(body.additionalIncome) : 0;
  const rentMortgage = body.rentMortgage ? Number(body.rentMortgage) : 0;
  const otherCharges = body.otherCharges ? Number(body.otherCharges) : 0;
  const loanPayment = body.loanPayment ? Number(body.loanPayment) : 0;
  const { score, score_category: scoreCategory } = scoreAndCategoryForDb({
    monthly_income: monthlyIncome,
    additional_income: additionalIncome,
    rent_mortgage: rentMortgage,
    other_charges: otherCharges,
    loan_payment: loanPayment,
    amount,
    duration,
  });
  const trackingCode = randomBytes(4).toString('hex');
  const gEstRaw = body.guaranteeEstimatedValue;
  const guaranteeEstimatedValue =
    gEstRaw !== undefined && gEstRaw !== null && String(gEstRaw).trim() !== ''
      ? Number(gEstRaw)
      : null;
  const guaranteeEstimatedDb = Number.isFinite(guaranteeEstimatedValue as number) ? guaranteeEstimatedValue : null;

  const { data, error } = await supabase
    .from('credit_requests')
    .insert({
      user_id: profileId,
      tracking_code: trackingCode,
      client_name: fullName,
      client_email: email,
      amount,
      duration,
      status: 'pending',
      score,
      score_category: scoreCategory,
      monthly_income: monthlyIncome,
      profession: body.profession || null,
      employment_status: body.employmentStatus || null,
      employer: body.employer || null,
      years_experience: body.yearsExperience ? Number(body.yearsExperience) : null,
      work_address: body.workAddress || null,
      additional_income: additionalIncome,
      rent_mortgage: rentMortgage,
      other_charges: otherCharges,
      existing_loans: body.existingLoans || null,
      loan_payment: loanPayment,
      credit_purpose: body.creditPurpose || null,
      guarantee_type: body.guaranteeType || null,
      guarantee_estimated_value: guaranteeEstimatedDb,
      notes: body.notes || null,
      documents: Array.isArray(body.documents) ? body.documents : ['CIN', 'Bulletins de salaire', 'Relevés bancaires'],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await logActivity({
    userId: profileId,
    action: 'request_created',
    entityType: 'credit_request',
    entityId: data.id,
    details: { amount: data.amount, status: data.status },
  });
  return NextResponse.json(dbRowToCreditRequest(data as Parameters<typeof dbRowToCreditRequest>[0]));
}
