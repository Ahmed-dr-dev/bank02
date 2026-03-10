'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type ClientRow = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  totalAmount: number;
  lastRequest: { status: string; amount: number; submitted_at: string } | null;
};

const statusLabel: Record<string, string> = {
  approved: 'Approuvé',
  pending: 'En attente',
  rejected: 'Refusé',
  guarantees_required: 'Garanties requises',
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

export default function AgentClients() {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'approved' | 'no_request'>('all');

  const fetchClients = useCallback(() => {
    setLoading(true);
    fetch('/api/agent/clients', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { clients: [] }))
      .then((d) => setClients(Array.isArray(d.clients) ? d.clients : []))
      .catch(() => setClients([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const filtered = clients
    .filter((c) => {
      if (filter === 'active') return c.pendingRequests > 0;
      if (filter === 'approved') return c.approvedRequests > 0;
      if (filter === 'no_request') return c.totalRequests === 0;
      return true;
    })
    .filter((c) => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (c.full_name ?? '').toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    });

  const totalActive = clients.filter((c) => c.pendingRequests > 0).length;
  const totalApproved = clients.filter((c) => c.approvedRequests > 0).length;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600 mt-1">Tous les clients et l'état de leurs dossiers</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">
          <p className="text-sm text-gray-500">Total clients</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{clients.length}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-yellow-400">
          <p className="text-sm text-gray-500">Dossiers actifs</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{totalActive}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-green-400">
          <p className="text-sm text-gray-500">Au moins un approuvé</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{totalApproved}</p>
        </div>
        <div className="bg-white rounded-2xl shadow p-5 border-l-4 border-gray-400">
          <p className="text-sm text-gray-500">Sans demande</p>
          <p className="text-3xl font-bold text-gray-600 mt-1">{clients.filter((c) => c.totalRequests === 0).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-5 mb-6 border border-gray-100 flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[220px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'approved', 'no_request'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {f === 'all' ? 'Tous' : f === 'active' ? 'Dossier actif' : f === 'approved' ? 'Approuvé' : 'Sans demande'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Aucun client trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inscrit le</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Demandes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dernier dossier</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Vol. total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{c.full_name || '—'}</div>
                      <div className="text-sm text-gray-500">{c.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{formatDate(c.created_at)}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2 flex-wrap">
                        {c.totalRequests === 0 ? (
                          <span className="text-gray-400 text-sm">—</span>
                        ) : (
                          <>
                            {c.pendingRequests > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">{c.pendingRequests} att.</span>
                            )}
                            {c.approvedRequests > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">{c.approvedRequests} app.</span>
                            )}
                            {c.rejectedRequests > 0 && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">{c.rejectedRequests} ref.</span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {c.lastRequest ? (
                        <div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass[c.lastRequest.status] || 'bg-gray-100'}`}>
                            {statusLabel[c.lastRequest.status] ?? c.lastRequest.status}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(c.lastRequest.submitted_at)}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap font-semibold text-gray-900">
                      {c.totalAmount > 0 ? formatTND(c.totalAmount) : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/agent/requests?client=${encodeURIComponent(c.email)}`}
                        className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                      >
                        Voir dossiers →
                      </Link>
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
