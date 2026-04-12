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
  return { supabase };
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const keywords = body.keywords !== undefined ? parseKeywords(body.keywords) : undefined;
  const reply = typeof body.reply === 'string' ? body.reply.trim() : undefined;

  if (keywords !== undefined && !keywords?.length) {
    return NextResponse.json({ error: 'Au moins un mot-clé requis' }, { status: 400 });
  }
  if (reply !== undefined && !reply) {
    return NextResponse.json({ error: 'Réponse non vide requise' }, { status: 400 });
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (keywords) patch.keywords = keywords;
  if (reply !== undefined) patch.reply = reply;

  if (Object.keys(patch).length <= 1) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('assistant_replies')
    .update(patch)
    .eq('id', id)
    .select('id, keywords, reply, sort_order, created_at, updated_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  return NextResponse.json({ reply: data });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin();
  if ('error' in auth && auth.error) return auth.error;
  const { supabase } = auth;
  const { id } = await ctx.params;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase.from('assistant_replies').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
