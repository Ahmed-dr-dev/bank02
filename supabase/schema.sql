-- CreditPro Tunisie – tables only (no RLS, no policies)
-- Auth via profiles table only (no auth.users). Run in Supabase SQL Editor.

create extension if not exists "uuid-ossp";

-- Profiles (single auth table: email + password_hash)
create table public.profiles (
  id uuid primary key default uuid_generate_v4(),
  email text not null unique,
  password_hash text not null,
  full_name text,
  phone text,
  date_of_birth date,
  cin text,
  address text,
  city text,
  postal_code text,
  country text default 'Tunisie',
  profession text,
  employer text,
  years_experience int,
  monthly_income numeric(12,2),
  rib text,
  iban text,
  role text not null default 'client' check (role in ('client','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email on public.profiles(email);

-- Credit requests
create table public.credit_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_name text not null,
  client_email text not null,
  amount numeric(12,2) not null,
  duration int not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','guarantees_required')),
  score int,
  score_category text check (score_category in ('low','medium','high')),
  monthly_income numeric(12,2),
  profession text,
  employment_status text,
  employer text,
  years_experience int,
  work_address text,
  additional_income numeric(12,2) default 0,
  rent_mortgage numeric(12,2) default 0,
  other_charges numeric(12,2) default 0,
  existing_loans text,
  loan_payment numeric(12,2) default 0,
  credit_purpose text,
  guarantee_type text,
  guarantee_estimated_value numeric(12,2),
  notes text,
  documents text[] default '{}',
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index credit_requests_user_id on public.credit_requests(user_id);
create index credit_requests_status on public.credit_requests(status);
create index credit_requests_submitted_at on public.credit_requests(submitted_at desc);
