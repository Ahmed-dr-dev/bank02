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

  // Get all requests that have at least one message
  const { data: msgs, error } = await supabase
    .from('messages')
    .select('id, request_id, sender_role, content, read_at, created_at')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Get all unique request_ids
  const requestIds = [...new Set((msgs ?? []).map((m) => m.request_id))];
  if (!requestIds.length) return NextResponse.json({ conversations: [] });

  // Get request details
  const { data: requests } = await supabase
    .from('credit_requests')
    .select('id, tracking_code, client_name, client_email, status')
    .in('id', requestIds);

  const reqMap: Record<string, typeof requests extends (infer T)[] | null ? T : never> = {};
  for (const r of requests ?? []) reqMap[r.id] = r;

  // Build conversations
  const conversations = requestIds.map((rid) => {
    const reqMsgs = (msgs ?? []).filter((m) => m.request_id === rid);
    const lastMsg = reqMsgs[0] ?? null; // already sorted desc
    const unreadCount = reqMsgs.filter((m) => m.sender_role === 'client' && !m.read_at).length;
    const req = reqMap[rid];
    return {
      requestId: rid,
      trackingCode: req?.tracking_code ?? null,
      clientName: req?.client_name ?? '—',
      clientEmail: req?.client_email ?? '—',
      requestStatus: req?.status ?? 'pending',
      lastMessage: lastMsg
        ? { content: lastMsg.content, sender_role: lastMsg.sender_role, created_at: lastMsg.created_at, read_at: lastMsg.read_at }
        : null,
      unreadCount,
      totalMessages: reqMsgs.length,
    };
  });

  // Sort by unread first, then by last message date
  conversations.sort((a, b) => {
    if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
    const aDate = a.lastMessage?.created_at ?? '';
    const bDate = b.lastMessage?.created_at ?? '';
    return bDate.localeCompare(aDate);
  });

  return NextResponse.json({ conversations });
}
