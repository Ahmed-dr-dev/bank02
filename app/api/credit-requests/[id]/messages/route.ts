import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSessionProfileId } from '@/lib/session';

async function resolveAccess(requestId: string, profileId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: req } = await supabase
    .from('credit_requests')
    .select('user_id')
    .eq('id', requestId)
    .single();
  if (!req) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', profileId)
    .single();
  if (!profile) return null;

  const isOwner = req.user_id === profileId;
  const isStaff = profile.role === 'credit_officer' || profile.role === 'admin';
  if (!isOwner && !isStaff) return null;

  return { role: profile.role as string, name: profile.full_name || profile.email, isOwner, isStaff };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { id } = await params;

  const access = await resolveAccess(id, profileId, supabase);
  if (!access) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // Fetch messages with sender name
  const { data: msgs, error } = await supabase
    .from('messages')
    .select('id, sender_id, sender_role, content, read_at, created_at, profiles(full_name, email)')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Mark incoming messages as read (from the other party)
  const incomingRole = access.isStaff ? 'client' : null;
  const incomingRoles = access.isStaff ? ['client'] : ['credit_officer', 'admin'];
  const unreadIds = (msgs ?? [])
    .filter((m) => incomingRoles.includes(m.sender_role) && !m.read_at && m.sender_id !== profileId)
    .map((m) => m.id);

  if (unreadIds.length > 0) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds);
  }
  void incomingRole;

  const messages = (msgs ?? []).map((m) => {
    const prof = Array.isArray(m.profiles) ? m.profiles[0] : (m.profiles as { full_name: string | null; email: string } | null);
    return {
      id: m.id,
      sender_id: m.sender_id,
      sender_role: m.sender_role,
      sender_name: prof?.full_name || prof?.email || null,
      content: m.content,
      read_at: m.read_at,
      created_at: m.created_at,
    };
  });

  return NextResponse.json({ messages, currentUserId: profileId });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profileId = await getSessionProfileId();
  if (!profileId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { id } = await params;

  const access = await resolveAccess(id, profileId, supabase);
  if (!access) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const content = String(body.content ?? '').trim();
  if (!content) return NextResponse.json({ error: 'Message vide' }, { status: 400 });
  if (content.length > 2000) return NextResponse.json({ error: 'Message trop long (max 2000 caractères)' }, { status: 400 });

  const { data: msg, error } = await supabase
    .from('messages')
    .insert({
      request_id: id,
      sender_id: profileId,
      sender_role: access.role,
      content,
    })
    .select('id, sender_id, sender_role, content, read_at, created_at')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ...msg,
    sender_name: access.name,
  });
}
