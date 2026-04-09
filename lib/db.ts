import type { CreditRequest } from '@/lib/mockData';

export type DbCreditRequest = {
  id: string;
  user_id: string;
  client_name: string;
  client_email: string;
  amount: number;
  duration: number;
  status: CreditRequest['status'];
  score: number | null;
  score_category: CreditRequest['scoreCategory'] | null;
  monthly_income: number | null;
  profession: string | null;
  employment_status: string | null;
  employer: string | null;
  years_experience: number | null;
  work_address: string | null;
  additional_income: number | null;
  rent_mortgage: number | null;
  other_charges: number | null;
  existing_loans: string | null;
  loan_payment: number | null;
  credit_purpose: string | null;
  guarantee_type: string | null;
  guarantee_estimated_value: number | null;
  notes: string | null;
  documents: string[];
  submitted_at: string;
  updated_at: string;
  tracking_code: string | null;
};

export function dbRowToCreditRequest(row: DbCreditRequest): CreditRequest {
  return {
    id: row.id,
    clientName: row.client_name,
    clientEmail: row.client_email,
    amount: Number(row.amount),
    duration: row.duration,
    status: row.status,
    score: row.score ?? 0,
    scoreCategory: (row.score_category as CreditRequest['scoreCategory']) ?? 'medium',
    submittedAt: row.submitted_at,
    updatedAt: row.updated_at,
    monthlyIncome: Number(row.monthly_income) ?? 0,
    profession: row.profession ?? '',
    documents: Array.isArray(row.documents) ? row.documents : [],
    employmentStatus: row.employment_status ?? undefined,
    employer: row.employer ?? undefined,
    yearsExperience: row.years_experience ?? undefined,
    workAddress: row.work_address ?? undefined,
    additionalIncome: Number(row.additional_income) ?? 0,
    rentMortgage: Number(row.rent_mortgage) ?? 0,
    otherCharges: Number(row.other_charges) ?? 0,
    existingLoans: row.existing_loans ?? undefined,
    loanPayment: Number(row.loan_payment) ?? 0,
    creditPurpose: row.credit_purpose ?? undefined,
    guaranteeType: row.guarantee_type ?? undefined,
    guaranteeEstimatedValue:
      row.guarantee_estimated_value != null ? Number(row.guarantee_estimated_value) : undefined,
    notes: row.notes ?? undefined,
    trackingCode: row.tracking_code ?? undefined,
  };
}
