-- Messaging between client and credit officer (chargé de crédit)
-- Run in Supabase SQL Editor if not using CLI migrations.

create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  request_id   uuid not null references public.credit_requests(id) on delete cascade,
  sender_id    uuid references public.profiles(id) on delete set null,
  sender_role  text not null check (sender_role in ('client', 'credit_officer', 'admin')),
  content      text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  -- read_at is set when the other party reads the message
  read_at      timestamptz default null,
  created_at   timestamptz not null default now()
);

create index if not exists messages_request_id_idx on public.messages(request_id);
create index if not exists messages_sender_id_idx  on public.messages(sender_id);
create index if not exists messages_unread_idx     on public.messages(read_at) where read_at is null;
