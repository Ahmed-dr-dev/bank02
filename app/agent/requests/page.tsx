'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { CreditRequest } from '@/lib/mockData';
import ScoreBadge from '@/components/ScoreBadge';

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
function formatDate(s: string) {
  return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AgentRequests() {
  const searchParams = useSearchParams();
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') ?? '');
  const [scoreFilter, setScoreFilter] = useState('');
  const [search, setSearch] = useState(searchParams.get('client') ?? '');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    fetch('/api/credit-requests', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    let list = requests;
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (scoreFilter === 'high') list = list.filter((r) => (r.score ?? 0) >= 70);
    if (scoreFilter === 'medium') list = list.filter((r) => { const s = r.score ?? 0; return s >= 50 && s < 70; });
    if (scoreFilter === 'low') list = list.filter((r) => (r.score ?? 0) < 50);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => (r.clientName ?? '').toLowerCase().includes(q) || (r.clientEmail ?? '').toLowerCase().includes(q));
    }
    return list;
  }, [requests, statusFilter, scoreFilter, search]);

  const quickAction = async (reqId: string, status: 'approved' | 'rejected' | 'guarantees_required') => {
    setActionLoading(reqId + status);
    try {
      const res = await fetch(`/api/credit-requests/${reqId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests((prev) => prev.map((r) => (r.id === reqId ? updated : r)));
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Erreur');
      }
    } finally { setActionLoading(null); }
  };

  const clearFilters = () => { setStatusFilter(''); setScoreFilter(''); setSearch(''); };

  const pending = filteredRequests.filter((r) => r.status === 'pending').length;
  const approved = filteredRequests.filter((r) => r.status === 'approved').length;
  const rejected = filteredRequests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Demandes de crédit</h1>
        <p className="text-gray-600 mt-1">Instruire et décider des dossiers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 p-5 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">Statut</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Refusé</option>
              <option value="guarantees_required">Garanties req.</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1 uppercase">Score</label>
            <select value={scoreFilter} onChange={(e) => setScoreFilter(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500">
              <option value="">Tous</option>
              <option value="high">Élevé (70+)</option>
              <option value="medium">Moyen (50-69)</option>
              <option value="low">Faible (&lt;50)</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-end gap-2">
            <input
              type="text"
              placeholder="Nom ou e-mail…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            />
            <button onClick={clearFilters} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm">Reset</button>
          </div>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Affichés', value: filteredRequests.length, color: 'text-slate-700' },
          { label: 'En attente', value: pending, color: 'text-yellow-600' },
          { label: 'Approuvés', value: approved, color: 'text-green-600' },
          { label: 'Refusés', value: rejected, color: 'text-red-600' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl shadow border border-gray-100 p-4 text-center">
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filteredRequests.length === 0 ? (
          <p className="text-center text-gray-500 py-12">
            Aucun dossier.{' '}
            <button onClick={clearFilters} className="text-emerald-600 hover:underline font-medium">Réinitialiser</button>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durée</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-900 truncate max-w-[140px]">{req.clientName}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[140px]">{req.clientEmail}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-semibold text-gray-900">{formatTND(req.amount)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{req.duration} mois</td>
                    <td className="px-4 py-4">
                      <ScoreBadge score={req.score} category={req.scoreCategory} size="sm" />
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusClass[req.status] || 'bg-gray-100'}`}>
                        {statusLabel[req.status] ?? req.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">{formatDate(req.submittedAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/agent/requests/${req.id}`} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 whitespace-nowrap">
                          Voir
                        </Link>
                        {req.status === 'pending' && (
                          <>
                            <button
                              disabled={actionLoading === req.id + 'approved'}
                              onClick={() => quickAction(req.id, 'approved')}
                              title="Approuver"
                              className="w-7 h-7 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-bold text-sm disabled:opacity-50 flex items-center justify-center"
                            >
                              ✓
                            </button>
                            <button
                              disabled={actionLoading === req.id + 'guarantees_required'}
                              onClick={() => quickAction(req.id, 'guarantees_required')}
                              title="Garanties requises"
                              className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 font-bold text-sm disabled:opacity-50 flex items-center justify-center"
                            >
                              ⚠
                            </button>
                            <button
                              disabled={actionLoading === req.id + 'rejected'}
                              onClick={() => quickAction(req.id, 'rejected')}
                              title="Refuser"
                              className="w-7 h-7 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 font-bold text-sm disabled:opacity-50 flex items-center justify-center"
                            >
                              ✗
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
