alter table public.profiles
  add column if not exists rib text,
  add column if not exists iban text;

comment on column public.profiles.rib is 'RIB tunisien (20 chiffres), saisi à l''inscription';
comment on column public.profiles.iban is 'IBAN (ex. TN…), saisi à l''inscription';
