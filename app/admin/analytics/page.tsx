'use client';

import { useCallback, useEffect, useState } from 'react';

type MonthlyRow = {
  month: string;
  monthLabel: string;
  year: number;
  requests: number;
  approved: number;
  rejected: number;
  pending: number;
  guarantees: number;
};

type Analytics = {
  monthlyTrend: MonthlyRow[];
  totalVolume: number;
  uniqueClients: number;
  totalRequests: number;
  avgProcessingDays: number | null;
  topProfessions: { profession: string; count: number }[];
  amountByPurpose: { purpose: string; count: number; totalAmount: number; avgAmount: number }[];
  scoreDistributionByMonth: { month: string; high: number; medium: number; low: number; avgScore: number }[];
};

function formatTND(n: number) {
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' TND';
}

export default function AdminAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/analytics', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="grid md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const a = data ?? {
    monthlyTrend: [],
    totalVolume: 0,
    uniqueClients: 0,
    totalRequests: 0,
    avgProcessingDays: null,
    topProfessions: [],
    amountByPurpose: [],
    scoreDistributionByMonth: [],
  };
  const maxRequests = Math.max(1, ...a.monthlyTrend.map((m) => m.requests));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & rapports</h1>
        <p className="text-gray-600 mt-1">Indicateurs et performances sur les données réelles</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Volume total (montants demandés)</p>
          <p className="text-3xl font-bold text-gray-900">{formatTND(a.totalVolume)}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Délai moyen de traitement</p>
          <p className="text-3xl font-bold text-gray-900">
            {a.avgProcessingDays != null ? `${a.avgProcessingDays} j` : '—'}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Demandes totales</p>
          <p className="text-3xl font-bold text-gray-900">{a.totalRequests}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <p className="text-sm text-gray-600 mb-2">Clients uniques (demandeurs)</p>
          <p className="text-3xl font-bold text-gray-900">{a.uniqueClients}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Demandes par mois</h2>
          {a.monthlyTrend.length === 0 ? (
            <p className="text-gray-500">Aucune donnée.</p>
          ) : (
            <div className="space-y-4">
              {a.monthlyTrend.map((m) => (
                <div key={m.month}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{m.monthLabel}</span>
                    <span className="text-sm font-semibold text-gray-900">{m.requests} demandes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${maxRequests ? (m.requests / maxRequests) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Taux d’approbation par mois</h2>
          {a.monthlyTrend.length === 0 ? (
            <p className="text-gray-500">Aucune donnée.</p>
          ) : (
            <div className="space-y-4">
              {a.monthlyTrend.map((m) => {
                const rate = m.requests ? (m.approved / m.requests) * 100 : 0;
                return (
                  <div key={m.month}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">{m.monthLabel}</span>
                      <span className="text-sm font-semibold text-green-600">{rate.toFixed(1)} %</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div className="bg-green-500 h-3 rounded-full" style={{ width: `${rate}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Scores par mois</h2>
        {a.scoreDistributionByMonth.length === 0 ? (
          <p className="text-gray-500">Aucune donnée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mois</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score élevé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score moyen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score faible</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score moy.</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {a.scoreDistributionByMonth.map((row) => (
                  <tr key={row.month}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{row.month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-green-600 font-semibold">{row.high}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-yellow-600 font-semibold">{row.medium}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-red-600 font-semibold">{row.low}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-semibold">{row.avgScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Top professions (demandeurs)</h2>
          {a.topProfessions.length === 0 ? (
            <p className="text-gray-500">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {a.topProfessions.map((item) => (
                <div key={item.profession} className="flex items-center justify-between">
                  <span className="text-gray-700 truncate mr-2">{item.profession}</span>
                  <span className="font-semibold text-gray-900 shrink-0">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Montant moyen par objet du crédit</h2>
          {a.amountByPurpose.length === 0 ? (
            <p className="text-gray-500">Aucune donnée.</p>
          ) : (
            <div className="space-y-3">
              {a.amountByPurpose.map((item) => (
                <div key={item.purpose} className="flex items-center justify-between gap-4">
                  <span className="text-gray-700 truncate">{item.purpose}</span>
                  <span className="font-semibold text-gray-900 shrink-0">
                    {formatTND(item.avgAmount)} <span className="text-gray-500 font-normal">({item.count})</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
