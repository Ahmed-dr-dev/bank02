import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim();
  if (!code) return NextResponse.json({ error: 'Code requis' }, { status: 400 });

  const supabase = await createClient();
  const { data: id, error } = await supabase.rpc('get_request_id_by_code', { c: code });

  if (error) {
    const { data: row } = await supabase
      .from('credit_requests')
      .select('id')
      .eq('tracking_code', code.toLowerCase())
      .limit(1)
      .single();
    if (row) return NextResponse.json({ id: row.id });
    return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  }

  if (!id) return NextResponse.json({ error: 'Dossier introuvable' }, { status: 404 });
  return NextResponse.json({ id });
}
