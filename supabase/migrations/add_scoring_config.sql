-- Scoring configuration (key-value for admin settings)
create table if not exists public.scoring_config (
  key text primary key,
  value jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

insert into public.scoring_config (key, value) values
  ('thresholds', '{"minApprovalScore": 70, "maxDebtRatioPercent": 40, "interestRatePercent": 4.5}'::jsonb),
  ('highScoreMin', '70'),
  ('mediumScoreMin', '50')
on conflict (key) do nothing;
