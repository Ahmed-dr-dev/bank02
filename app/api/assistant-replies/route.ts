import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Public: keyword replies for the site assistant (merged client-side with static defaults). */
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('assistant_replies')
    .select('id, keywords, reply, sort_order')
    .order('sort_order', { ascending: true })
    .order('id', { ascending: true });

  if (error) {
    return NextResponse.json({ replies: [] });
  }

  const replies = (data ?? []).map((r) => ({
    id: r.id as string,
    keywords: Array.isArray(r.keywords) ? (r.keywords as unknown[]).map(String) : [],
    reply: String(r.reply ?? ''),
    sort_order: Number(r.sort_order ?? 0),
  }));

  return NextResponse.json({ replies });
}
