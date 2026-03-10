-- Loan types configuration (admin-managed)
-- Run in Supabase SQL Editor.

create table if not exists public.loan_types (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  description           text,
  min_amount            numeric not null default 1000,
  max_amount            numeric not null default 500000,
  min_duration_months   integer not null default 6,
  max_duration_months   integer not null default 300,
  interest_rate_percent numeric not null default 4.5,
  max_debt_ratio_percent numeric not null default 40,
  required_documents    text[] not null default array['CIN', 'Bulletins de salaire (3 mois)', 'Relevés bancaires (6 mois)'],
  active                boolean not null default true,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Seed default loan types (safe to re-run)
insert into public.loan_types (name, description, min_amount, max_amount, min_duration_months, max_duration_months, interest_rate_percent, max_debt_ratio_percent, required_documents)
values
  ('Crédit à la consommation',
   'Financement de biens et services personnels (électroménager, voyages, études…)',
   1000, 100000, 6, 84, 8.5, 40,
   array['CIN (recto/verso)', 'Bulletins de salaire (3 derniers mois)', 'Relevés bancaires (6 derniers mois)']),

  ('Crédit immobilier',
   'Acquisition ou construction de bien immobilier résidentiel',
   50000, 800000, 60, 300, 5.5, 35,
   array['CIN (recto/verso)', 'Bulletins de salaire (3 derniers mois)', 'Relevés bancaires (6 derniers mois)', 'Justificatif de domicile', 'Compromis de vente ou permis de construire']),

  ('Crédit auto',
   'Financement d''un véhicule neuf ou d''occasion',
   5000, 200000, 12, 84, 7.5, 40,
   array['CIN (recto/verso)', 'Bulletins de salaire (3 derniers mois)', 'Facture pro forma ou bon de commande']),

  ('Crédit professionnel',
   'Financement d''activité professionnelle, investissement ou fonds de roulement',
   10000, 500000, 12, 120, 6.5, 45,
   array['CIN (recto/verso)', 'Registre de commerce', 'Bilan comptable (2 dernières années)', 'Relevés bancaires (12 derniers mois)'])
on conflict do nothing;
