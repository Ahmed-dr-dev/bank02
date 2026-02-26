-- Activity logs for admin audit
create table if not exists public.activity_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  details jsonb default '{}',
  created_at timestamptz not null default now()
);

create index activity_logs_created_at on public.activity_logs(created_at desc);
create index activity_logs_user_id on public.activity_logs(user_id);
create index activity_logs_action on public.activity_logs(action);
