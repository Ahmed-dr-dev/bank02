-- FAQ / keyword replies for the public chat assistant (admin-managed)
create table if not exists public.assistant_replies (
  id uuid primary key default uuid_generate_v4(),
  keywords text[] not null,
  reply text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index assistant_replies_sort on public.assistant_replies (sort_order asc, id asc);
