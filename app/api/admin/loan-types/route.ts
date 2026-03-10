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

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin' && profile?.role !== 'credit_officer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { data, error } = await supabase
    .from('loan_types')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ loanTypes: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await requireAdmin();
  if (!supabase) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const { name, description, min_amount, max_amount, min_duration_months, max_duration_months, interest_rate_percent, max_debt_ratio_percent, required_documents } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Le nom est requis' }, { status: 400 });

  const { data, error } = await supabase
    .from('loan_types')
    .insert({
      name: name.trim(),
      description: description?.trim() || null,
      min_amount: Number(min_amount) || 1000,
      max_amount: Number(max_amount) || 500000,
      min_duration_months: parseInt(min_duration_months) || 6,
      max_duration_months: parseInt(max_duration_months) || 120,
      interest_rate_percent: Number(interest_rate_percent) || 4.5,
      max_debt_ratio_percent: Number(max_debt_ratio_percent) || 40,
      required_documents: Array.isArray(required_documents) ? required_documents : ['CIN', 'Bulletins de salaire (3 mois)', 'Relevés bancaires (6 mois)'],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
