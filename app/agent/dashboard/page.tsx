'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusDistributionDonut from '@/components/StatusDistributionDonut';

type OfficerStats = {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  guaranteesRequests: number;
  processedRequests: number;
  approvalRate: number;
  averageScore: number;
  thisMonth: number;
  thisMonthPending: number;
  scoreDistribution: { high: number; medium: number; low: number; highCount: number; mediumCount: number; lowCount: number };
  recentRequests: Array<{ id: string; status: string; score: number | null; score_category: string | null; amount: number; client_name: string; duration: number; submitted_at: string }>;
  recentPending: Array<{ id: string; status: string; score: number | null; score_category: string | null; amount: number; client_name: string; duration: number; submitted_at: string }>;
  role: string;
};

const statusLabel: Record<string, string> = {
  approved: 'Approuvé',
  pending: 'En attente',
  rejected: 'Refusé',
  guarantees_required: 'Garanties req.',
};
const statusClass: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  guarantees_required: 'bg-orange-100 text-orange-800',
};

function formatTND(n: number) {
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' TND';
}
function formatDate(x: string) {
  return new Date(x).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AgentDashboard() {
  const [stats, setStats] = useState<OfficerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard/stats', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-1/3" />
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const s: OfficerStats = stats ?? {
    totalRequests: 0, pendingRequests: 0, approvedRequests: 0, rejectedRequests: 0,
    guaranteesRequests: 0, processedRequests: 0, approvalRate: 0, averageScore: 0,
    thisMonth: 0, thisMonthPending: 0,
    scoreDistribution: { high: 0, medium: 0, low: 0, highCount: 0, mediumCount: 0, lowCount: 0 },
    recentRequests: [], recentPending: [], role: 'credit_officer',
  };
  const dist = s.scoreDistribution;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-600 mt-1">Suivi des dossiers de crédit</p>
      </div>

      {/* KPI cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total dossiers</p>
          <p className="text-3xl font-bold text-gray-900">{s.totalRequests}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-500 mb-1">En attente</p>
          <p className="text-3xl font-bold text-yellow-600">{s.pendingRequests}</p>
          <p className="text-xs text-gray-400 mt-1">À instruire</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-emerald-400">
          <p className="text-sm text-gray-500 mb-1">Taux d'approbation</p>
          <p className="text-3xl font-bold text-emerald-600">{s.approvalRate} %</p>
          <p className="text-xs text-gray-400 mt-1">{s.processedRequests} traités</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-400">
          <p className="text-sm text-gray-500 mb-1">Score moyen</p>
          <p className="text-3xl font-bold text-blue-600">{s.averageScore}</p>
          <p className="text-xs text-gray-400 mt-1">Tous dossiers</p>
        </div>
      </div>

      {/* Status breakdown + score distribution */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Répartition par statut</h2>
          <StatusDistributionDonut
            approved={s.approvedRequests}
            pending={s.pendingRequests}
            guarantees={s.guaranteesRequests}
            rejected={s.rejectedRequests}
          />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-5">Répartition des scores</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Élevé (70-100)</span>
                <span className="text-sm font-semibold text-green-600">{dist.high} % ({dist.highCount})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: `${dist.high}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Moyen (50-69)</span>
                <span className="text-sm font-semibold text-yellow-600">{dist.medium} % ({dist.mediumCount})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${dist.medium}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Faible (0-49)</span>
                <span className="text-sm font-semibold text-red-600">{dist.low} % ({dist.lowCount})</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: `${dist.low}%` }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-gray-500">Ce mois</p>
              <p className="text-2xl font-bold text-slate-700">{s.thisMonth}</p>
              <p className="text-xs text-gray-400">dossiers reçus</p>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded-xl">
              <p className="text-xs text-gray-500">Ce mois</p>
              <p className="text-2xl font-bold text-yellow-600">{s.thisMonthPending}</p>
              <p className="text-xs text-gray-400">en attente</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending requests to process */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">En attente de traitement</h2>
            <Link href="/agent/requests?status=pending" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">Voir tout →</Link>
          </div>
          <div className="p-5 space-y-3">
            {s.recentPending.length === 0 ? (
              <p className="text-gray-400 text-center py-6">Aucun dossier en attente.</p>
            ) : (
              s.recentPending.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-emerald-400 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{req.client_name}</p>
                    <p className="text-xs text-gray-500">{formatTND(req.amount)} · {req.duration} mois · {formatDate(req.submitted_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${(req.score ?? 0) >= 70 ? 'bg-green-100 text-green-800' : (req.score ?? 0) >= 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                      {req.score ?? '—'}
                    </span>
                    <Link href={`/agent/requests/${req.id}`} className="text-emerald-600 text-sm font-medium hover:underline">Traiter →</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent requests all statuses */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Derniers dossiers</h2>
            <Link href="/agent/requests" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">Voir tout →</Link>
          </div>
          <div className="p-5 space-y-3">
            {s.recentRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-6">Aucun dossier.</p>
            ) : (
              s.recentRequests.map((req) => (
                <div key={req.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-xl hover:border-slate-400 transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{req.client_name}</p>
                    <p className="text-xs text-gray-500">{formatTND(req.amount)} · {formatDate(req.submitted_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass[req.status] || 'bg-gray-100'}`}>
                      {statusLabel[req.status] ?? req.status}
                    </span>
                    <Link href={`/agent/requests/${req.id}`} className="text-slate-600 text-sm font-medium hover:underline">Voir →</Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
