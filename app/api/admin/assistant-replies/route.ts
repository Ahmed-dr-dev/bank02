import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

function parseKeywords(input: unknown): string[] | null {
  if (Array.isArray(input)) {
    const out = input.map((s) => String(s).trim()).filter(Boolean);
    return out.length ? out : null;
  }
  if (typeof input === 'string') {
    const out = input
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    return out.length ? out : null;
  }
  return null;
}

async function requireAdmin() {
  const profileId = await getSessionProfileId();
  if (!profileId) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'admin') return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { profileId, supabase };
}

export async function GET() {
  const auth = await requireAdmin();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from('assistant_replies')
    .select('id, keywords, reply, sort_order, created_at, updated_at')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ replies: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase } = auth;

  const body = await request.json().catch(() => ({}));
  const keywords = parseKeywords(body.keywords);
  const reply = typeof body.reply === 'string' ? body.reply.trim() : '';
  if (!keywords?.length || !reply) {
    return NextResponse.json({ error: 'Mots-clés (au moins un) et réponse requis' }, { status: 400 });
  }

  const { data: maxRows } = await supabase
    .from('assistant_replies')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = (maxRows?.[0]?.sort_order != null ? Number(maxRows[0].sort_order) : 0) + 1;

  const { data, error } = await supabase
    .from('assistant_replies')
    .insert({ keywords, reply, sort_order: nextOrder })
    .select('id, keywords, reply, sort_order, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reply: data });
}
