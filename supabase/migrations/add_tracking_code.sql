-- Run in Supabase SQL Editor: add tracking_code for "Suivi de mon crédit" without login

alter table public.credit_requests
  add column if not exists tracking_code text;

create unique index if not exists credit_requests_tracking_code_key on public.credit_requests(tracking_code) where tracking_code is not null;

-- Lookup by code (tracking_code exact or id prefix for requests without tracking_code)
create or replace function public.get_request_id_by_code(c text)
returns uuid language sql stable as $$
  select id from public.credit_requests
  where tracking_code = lower(trim(c)) or (length(trim(c)) >= 8 and id::text like lower(trim(c)) || '%')
  limit 1;
$$;
