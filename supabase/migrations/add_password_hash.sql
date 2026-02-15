-- Run in Supabase SQL Editor if profiles was created without password_hash

alter table public.profiles
  add column if not exists password_hash text not null default '';
