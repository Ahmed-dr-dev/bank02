// Mock data for the application

export interface CreditRequest {
  id: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'guarantees_required';
  score: number;
  scoreCategory: 'low' | 'medium' | 'high';
  submittedAt: string;
  updatedAt: string;
  monthlyIncome: number;
  profession: string;
  documents: string[];
  // Detail view
  employmentStatus?: string;
  employer?: string;
  yearsExperience?: number | null;
  workAddress?: string;
  additionalIncome?: number;
  rentMortgage?: number;
  otherCharges?: number;
  existingLoans?: string;
  loanPayment?: number;
  creditPurpose?: string;
  guaranteeType?: string;
  notes?: string;
  /** Code for "Suivi de mon crédit" on home (no login) */
  trackingCode?: string;
}

export const mockRequests: CreditRequest[] = [
  {
    id: '1',
    clientName: 'Sirine Nciri',
    clientEmail: 'sirine.nciri@email.com',
    amount: 250000,
    duration: 120,
    status: 'approved',
    score: 85,
    scoreCategory: 'high',
    submittedAt: '2026-01-20T10:30:00',
    updatedAt: '2026-01-21T14:20:00',
    monthlyIncome: 15000,
    profession: 'Software Engineer',
    documents: ['ID Card', 'Pay Slip', 'Bank Statement'],
  },
  {
    id: '2',
    clientName: 'Sirine Nciri',
    clientEmail: 'sirine.nciri@email.com',
    amount: 180000,
    duration: 84,
    status: 'pending',
    score: 72,
    scoreCategory: 'medium',
    submittedAt: '2026-01-22T09:15:00',
    updatedAt: '2026-01-22T09:15:00',
    monthlyIncome: 12000,
    profession: 'Teacher',
    documents: ['ID Card', 'Pay Slip'],
  },
  {
    id: '3',
    clientName: 'Sirine Nciri',
    clientEmail: 'sirine.nciri@email.com',
    amount: 500000,
    duration: 180,
    status: 'guarantees_required',
    score: 58,
    scoreCategory: 'medium',
    submittedAt: '2026-01-19T16:45:00',
    updatedAt: '2026-01-23T11:30:00',
    monthlyIncome: 18000,
    profession: 'Business Owner',
    documents: ['ID Card', 'Business Registration', 'Tax Statement'],
  },
  {
    id: '4',
    clientName: 'Sirine Nciri',
    clientEmail: 'sirine.nciri@email.com',
    amount: 320000,
    duration: 144,
    status: 'rejected',
    score: 42,
    scoreCategory: 'low',
    submittedAt: '2026-01-18T14:20:00',
    updatedAt: '2026-01-20T10:15:00',
    monthlyIncome: 8000,
    profession: 'Sales Representative',
    documents: ['ID Card'],
  },
];

export interface DashboardStats {
  totalRequests: number;
  approvalRate: number;
  averageScore: number;
  pendingRequests: number;
}

export const mockAdminStats: DashboardStats = {
  totalRequests: 248,
  approvalRate: 68.5,
  averageScore: 71.2,
  pendingRequests: 23,
};

export const mockClientStats = {
  activeRequests: 2,
  approvedRequests: 1,
  totalRequests: 3,
};
