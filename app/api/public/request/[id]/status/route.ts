import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;
  if (!id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('credit_requests')
    .select('id, status, amount, duration, submitted_at, updated_at')
    .eq('id', id)
    .single();

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const statusLabel =
    data.status === 'approved'
      ? 'Approuvé'
      : data.status === 'pending'
        ? 'En attente'
        : data.status === 'rejected'
          ? 'Refusé'
          : 'Garanties requises';

  return NextResponse.json({
    id: data.id,
    status: data.status,
    statusLabel,
    amount: Number(data.amount),
    duration: data.duration,
    submittedAt: data.submitted_at,
    updatedAt: data.updated_at,
  });
}
