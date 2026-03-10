-- Add credit_officer role (chargé de crédit / agent administratif)
-- Run in Supabase SQL Editor if migrations are not applied automatically.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('client', 'admin', 'credit_officer'));

-- Optional: assign requests to an officer (for future use)
alter table public.credit_requests add column if not exists assigned_to uuid references public.profiles(id) on delete set null;
create index if not exists credit_requests_assigned_to on public.credit_requests(assigned_to);
