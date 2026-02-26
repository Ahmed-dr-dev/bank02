'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/DataTable';
import type { CreditRequest } from '@/lib/mockData';

export default function AdminRequests() {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [scoreFilter, setScoreFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [amountFilter, setAmountFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  const fetchRequests = useCallback(() => {
    setLoading(true);
    fetch('/api/credit-requests', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const filteredRequests = useMemo(() => {
    let list = requests;

    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (scoreFilter === 'high') list = list.filter((r) => (r.score ?? 0) >= 70);
    if (scoreFilter === 'medium') list = list.filter((r) => { const s = r.score ?? 0; return s >= 50 && s < 70; });
    if (scoreFilter === 'low') list = list.filter((r) => (r.score ?? 0) < 50);
    if (periodFilter) {
      const days = parseInt(periodFilter, 10);
      if (!Number.isNaN(days)) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        since.setHours(0, 0, 0, 0);
        list = list.filter((r) => new Date(r.submittedAt) >= since);
      }
    }
    if (amountFilter === '0-100000') list = list.filter((r) => r.amount >= 0 && r.amount <= 100_000);
    if (amountFilter === '100000-300000') list = list.filter((r) => r.amount > 100_000 && r.amount <= 300_000);
    if (amountFilter === '300000-500000') list = list.filter((r) => r.amount > 300_000 && r.amount <= 500_000);
    if (amountFilter === '500000+') list = list.filter((r) => r.amount > 500_000);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.clientName ?? '').toLowerCase().includes(q) ||
          (r.clientEmail ?? '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [requests, statusFilter, scoreFilter, periodFilter, amountFilter, search]);

  const clearFilters = () => {
    setStatusFilter('');
    setScoreFilter('');
    setPeriodFilter('');
    setAmountFilter('');
    setSearch('');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Toutes les demandes</h1>
        <p className="text-gray-600 mt-1">Gérer et instruire les dossiers de crédit</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="grid md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Refusé</option>
              <option value="guarantees_required">Garanties requises</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Score</label>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="high">Élevé (70-100)</option>
              <option value="medium">Moyen (50-69)</option>
              <option value="low">Faible (0-49)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toute</option>
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant (TND)</label>
            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="0-100000">0 - 100 k</option>
              <option value="100000-300000">100 k - 300 k</option>
              <option value="300000-500000">300 k - 500 k</option>
              <option value="500000+">500 k+</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Réinitialiser
            </button>
          </div>
        </div>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Rechercher par nom ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Affichées</p>
          <p className="text-2xl font-bold text-gray-900">{filteredRequests.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Approuvées</p>
          <p className="text-2xl font-bold text-green-600">
            {filteredRequests.filter((r) => r.status === 'approved').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">En attente</p>
          <p className="text-2xl font-bold text-yellow-600">
            {filteredRequests.filter((r) => r.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Refus / Garanties</p>
          <p className="text-2xl font-bold text-red-600">
            {filteredRequests.filter((r) => r.status === 'rejected' || r.status === 'guarantees_required').length}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Chargement…</p>
        ) : (
          <DataTable
            requests={filteredRequests}
            linkPrefix="/admin/requests"
            locale="fr"
            currency="TND"
          />
        )}
      </div>
      {!loading && filteredRequests.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Aucun dossier. <button type="button" onClick={clearFilters} className="text-blue-600 hover:underline font-medium">Réinitialiser les filtres</button>
        </p>
      )}
    </div>
  );
}
