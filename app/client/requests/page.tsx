'use client';

import { useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/DataTable';
import type { CreditRequest } from '@/lib/mockData';

export default function ClientRequests() {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [amountFilter, setAmountFilter] = useState<string>('');

  useEffect(() => {
    fetch('/api/credit-requests')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredRequests = useMemo(() => {
    let list = requests;

    if (statusFilter) {
      list = list.filter((r) => r.status === statusFilter);
    }

    if (periodFilter) {
      const days = parseInt(periodFilter, 10);
      if (!Number.isNaN(days)) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        since.setHours(0, 0, 0, 0);
        list = list.filter((r) => new Date(r.submittedAt) >= since);
      }
    }

    if (amountFilter) {
      if (amountFilter === '0-100000') {
        list = list.filter((r) => r.amount >= 0 && r.amount <= 100_000);
      } else if (amountFilter === '100000-300000') {
        list = list.filter((r) => r.amount > 100_000 && r.amount <= 300_000);
      } else if (amountFilter === '300000+') {
        list = list.filter((r) => r.amount > 300_000);
      }
    }

    return list;
  }, [requests, statusFilter, periodFilter, amountFilter]);

  const clearFilters = () => {
    setStatusFilter('');
    setPeriodFilter('');
    setAmountFilter('');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes demandes de crédit</h1>
        <p className="text-gray-600 mt-1">Consultez et suivez l&apos;état de vos dossiers</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Refusé</option>
              <option value="guarantees_required">Garanties requises</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toute la période</option>
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">90 derniers jours</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Montant</label>
            <select
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les montants</option>
              <option value="0-100000">0 - 100 k TND</option>
              <option value="100000-300000">100 k - 300 k TND</option>
              <option value="300000+">300 k+ TND</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={clearFilters}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Réinitialiser
            </button>
            <span className="text-sm text-gray-500 self-center hidden md:inline">
              {filteredRequests.length} dossier{filteredRequests.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Chargement…</p>
        ) : (
          <DataTable
            requests={filteredRequests}
            linkPrefix="/client/request"
            locale="fr"
            currency="TND"
          />
        )}
      </div>
      {!loading && filteredRequests.length === 0 && (
        <p className="text-center text-gray-500 py-8">
          Aucun dossier ne correspond aux filtres. <button type="button" onClick={clearFilters} className="text-blue-600 hover:underline font-medium">Réinitialiser les filtres</button>
        </p>
      )}
    </div>
  );
}
