import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

export async function GET() {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ count: 0 });

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', profileId)
    .single();

  if (!profile) return NextResponse.json({ count: 0 });

  if (profile.role === 'client') {
    // Client: unread = messages from staff on their requests
    const { data: myReqs } = await supabase
      .from('credit_requests')
      .select('id')
      .eq('user_id', profileId);
    const reqIds = (myReqs ?? []).map((r) => r.id);
    if (!reqIds.length) return NextResponse.json({ count: 0 });

    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .in('request_id', reqIds)
      .in('sender_role', ['credit_officer', 'admin'])
      .is('read_at', null);

    return NextResponse.json({ count: count ?? 0 });
  }

  if (profile.role === 'credit_officer' || profile.role === 'admin') {
    // Staff: unread = messages from clients, not sent by me
    const { count } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender_role', 'client')
      .is('read_at', null);

    return NextResponse.json({ count: count ?? 0 });
  }

  return NextResponse.json({ count: 0 });
}
