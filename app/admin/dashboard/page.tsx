'use client';

import { useEffect, useState } from 'react';
import DashboardCard from '@/components/DashboardCard';
import StatusDistributionDonut from '@/components/StatusDistributionDonut';
import Link from 'next/link';

type Stats = {
  totalRequests: number;
  approvalRate: number;
  averageScore: number;
  pendingRequests: number;
  statusCounts?: { approved: number; pending: number; rejected: number; guarantees_required: number };
  scoreDistribution?: {
    high: number;
    medium: number;
    low: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
  recentRequests?: Array<{
    id: string;
    status: string;
    score: number | null;
    score_category: string | null;
    amount: number;
    submitted_at: string;
    client_name: string;
    duration: number;
  }>;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
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
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const s = stats ?? {
    totalRequests: 0,
    approvalRate: 0,
    averageScore: 0,
    pendingRequests: 0,
    statusCounts: { approved: 0, pending: 0, rejected: 0, guarantees_required: 0 },
    scoreDistribution: { high: 0, medium: 0, low: 0, highCount: 0, mediumCount: 0, lowCount: 0 },
    recentRequests: [],
  };
  const dist = s.scoreDistribution ?? { high: 0, medium: 0, low: 0, highCount: 0, mediumCount: 0, lowCount: 0 };
  const counts = s.statusCounts ?? { approved: 0, pending: 0, rejected: 0, guarantees_required: 0 };
  const recent = s.recentRequests ?? [];

  const formatTND = (n: number) => Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' TND';
  const formatDate = (x: string) => new Date(x).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord admin</h1>
        <p className="text-gray-600 mt-1">Vue d’ensemble des demandes de crédit</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Total demandes" value={s.totalRequests} icon="📋" />
        <DashboardCard title="Taux d’approbation" value={`${s.approvalRate} %`} icon="✅" />
        <DashboardCard title="Score moyen" value={s.averageScore} icon="📊" subtitle="Scoring" />
        <DashboardCard title="En attente" value={s.pendingRequests} icon="⏳" subtitle="À traiter" />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Répartition des scores</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Élevé (70-100)</span>
                <span className="text-sm font-semibold text-green-600">{dist.high} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{ width: `${dist.high}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Moyen (50-69)</span>
                <span className="text-sm font-semibold text-yellow-600">{dist.medium} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-yellow-500 h-3 rounded-full" style={{ width: `${dist.medium}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Faible (0-49)</span>
                <span className="text-sm font-semibold text-red-600">{dist.low} %</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-red-500 h-3 rounded-full" style={{ width: `${dist.low}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Par statut</h2>
          <StatusDistributionDonut
            approved={counts.approved}
            pending={counts.pending}
            guarantees={counts.guarantees_required}
            rejected={counts.rejected}
            legendLabels={{
              approved: 'Approuvées',
              guarantees: 'Garanties requises',
              rejected: 'Refusées',
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Dernières demandes</h2>
          <Link href="/admin/requests" className="text-blue-600 hover:text-blue-800 font-medium">
            Voir tout →
          </Link>
        </div>
        <div className="p-6">
          {recent.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune demande pour le moment.</p>
          ) : (
            <div className="space-y-4">
              {recent.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all bg-gradient-to-r from-white to-gray-50"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{req.client_name ?? '—'}</h3>
                    <p className="text-sm text-gray-600">
                      {formatTND(req.amount)} • {req.duration} mois • {formatDate(req.submitted_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        req.score_category === 'high'
                          ? 'bg-green-100 text-green-800'
                          : req.score_category === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      Score : {req.score ?? '—'}
                    </span>
                    <Link href={`/admin/requests/${req.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                      Voir →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
