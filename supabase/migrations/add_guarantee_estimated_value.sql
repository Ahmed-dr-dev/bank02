alter table public.credit_requests
  add column if not exists guarantee_estimated_value numeric(12,2);

comment on column public.credit_requests.guarantee_estimated_value is 'Valeur estimative de la garantie (TND), saisie par le client';
