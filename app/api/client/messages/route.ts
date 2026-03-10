import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', profileId).single();
  if (profile?.role !== 'client') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get all requests belonging to this client
  const { data: myReqs } = await supabase
    .from('credit_requests')
    .select('id, tracking_code, status, amount')
    .eq('user_id', profileId)
    .order('submitted_at', { ascending: false });

  if (!myReqs?.length) return NextResponse.json({ conversations: [] });

  const reqIds = myReqs.map((r) => r.id);

  // Get all messages for those requests
  const { data: msgs, error } = await supabase
    .from('messages')
    .select('id, request_id, sender_role, content, read_at, created_at')
    .in('request_id', reqIds)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const msgList = msgs ?? [];
  const reqMap: Record<string, typeof myReqs[0]> = {};
  for (const r of myReqs) reqMap[r.id] = r;

  // Build conversations for ALL requests (not just those with messages)
  const conversations = myReqs.map((req) => {
    const reqMsgs = msgList.filter((m) => m.request_id === req.id);
    const lastMsg = reqMsgs[0] ?? null;
    const unreadCount = reqMsgs.filter(
      (m) => (m.sender_role === 'credit_officer' || m.sender_role === 'admin') && !m.read_at
    ).length;
    return {
      requestId: req.id,
      trackingCode: req.tracking_code ?? null,
      requestStatus: req.status,
      amount: Number(req.amount),
      lastMessage: lastMsg
        ? { content: lastMsg.content, sender_role: lastMsg.sender_role, created_at: lastMsg.created_at, read_at: lastMsg.read_at }
        : null,
      unreadCount,
      totalMessages: reqMsgs.length,
    };
  });

  // Sort: unread first, then by last message date, then requests with no messages last
  conversations.sort((a, b) => {
    if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
    const aDate = a.lastMessage?.created_at ?? '';
    const bDate = b.lastMessage?.created_at ?? '';
    if (bDate !== aDate) return bDate.localeCompare(aDate);
    return 0;
  });

  return NextResponse.json({ conversations });
}
