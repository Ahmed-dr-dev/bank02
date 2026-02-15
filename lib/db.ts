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
  documents: string[];
  submitted_at: string;
  updated_at: string;
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
  };
}
