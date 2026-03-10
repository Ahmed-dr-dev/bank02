'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ScoreBadge from '@/components/ScoreBadge';
import type { CreditRequest } from '@/lib/mockData';

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

export default function AdminRequestDetail() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [request, setRequest] = useState<CreditRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/credit-requests/${id}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then(setRequest)
      .catch(() => setRequest(null))
      .finally(() => setLoading(false));
  }, [id]);


  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Dossier introuvable.</p>
        <Link href="/admin/requests" className="text-blue-600 hover:underline mt-2 inline-block">Retour aux demandes</Link>
      </div>
    );
  }

  const income = request.monthlyIncome || 1;
  const monthlyEst = Math.round((request.amount / request.duration) * 1.045);
  const debtRatio = ((monthlyEst / income) * 100).toFixed(1);

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/admin/requests" className="text-blue-600 hover:underline text-sm font-medium mb-2 inline-block">← Retour aux demandes</Link>
        <h1 className="text-3xl font-bold text-gray-900">Dossier #{request.trackingCode ?? request.id}</h1>
        <p className="text-gray-600 mt-1">Déposé le {new Date(request.submittedAt).toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Client</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div><p className="text-sm text-gray-600">Nom</p><p className="text-lg font-semibold text-gray-900">{request.clientName}</p></div>
              <div><p className="text-sm text-gray-600">E-mail</p><p className="text-lg font-semibold text-gray-900">{request.clientEmail}</p></div>
              <div><p className="text-sm text-gray-600">Profession</p><p className="text-lg font-semibold text-gray-900">{request.profession || '—'}</p></div>
              <div><p className="text-sm text-gray-600">Revenus mensuels</p><p className="text-lg font-semibold text-gray-900">{request.monthlyIncome ? `${Number(request.monthlyIncome).toLocaleString('fr-FR')} TND` : '—'}</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Crédit</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div><p className="text-sm text-gray-600">Montant</p><p className="text-2xl font-bold text-blue-600">{request.amount.toLocaleString('fr-FR')} TND</p></div>
              <div><p className="text-sm text-gray-600">Durée</p><p className="text-2xl font-bold text-gray-900">{request.duration} mois</p></div>
              <div><p className="text-sm text-gray-600">Mensualité (est.)</p><p className="text-lg font-semibold text-gray-900">{monthlyEst.toLocaleString('fr-FR')} TND</p></div>
              <div><p className="text-sm text-gray-600">Taux d'endettement</p><p className="text-lg font-semibold text-gray-900">{debtRatio} %</p></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Score</h2>
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700 font-medium">Score global</span>
              <ScoreBadge score={request.score} category={request.scoreCategory} size="lg" />
            </div>
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-2">Recommandation</h4>
              <p className="text-sm text-blue-800">
                {request.scoreCategory === 'high'
                  ? 'Capacité financière solide, risque faible. Approbation recommandée.'
                  : request.scoreCategory === 'medium'
                  ? 'Capacité modérée. Approbation possible avec conditions ou garanties complémentaires.'
                  : 'Risque plus élevé. Garanties ou co-signataire recommandés.'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Documents</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {(request.documents || []).map((doc, i) => (
                <div key={i} className="border border-gray-200 rounded-xl p-4 flex items-center justify-between">
                  <span className="font-medium text-gray-900">{doc}</span>
                  <a href={`/api/credit-requests/${id}/documents?file=${encodeURIComponent(doc)}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">Voir</a>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Statut</h3>
            <div className={`p-4 rounded-lg text-center font-semibold text-lg ${statusClass[request.status] || 'bg-gray-100'}`}>
              {statusLabel[request.status] ?? request.status}
            </div>
            <p className="text-sm text-gray-600 text-center mt-2">Modifié le {new Date(request.updatedAt).toLocaleDateString('fr-FR')}</p>
          </div>

          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
            <p className="text-sm text-indigo-800 font-medium">
              Les décisions sur les dossiers sont gérées par les chargés de crédit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
