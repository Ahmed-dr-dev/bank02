'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ScoreBadge from '@/components/ScoreBadge';
import QRCodeCard from '@/components/QRCodeCard';
import StatusTimeline from '@/components/StatusTimeline';
import type { CreditRequest } from '@/lib/mockData';

export default function ClientRequestDetail() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [request, setRequest] = useState<CreditRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    fetch(`/api/credit-requests/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setRequest)
      .catch(() => setRequest(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Chargement…</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <p className="text-gray-500">Dossier introuvable.</p>
        <Link href="/client/requests" className="text-blue-600 hover:underline mt-2 inline-block">Retour aux demandes</Link>
      </div>
    );
  }

  const timelineEvents = [
    { status: 'Dossier déposé', description: 'Votre demande a été enregistrée', date: new Date(request.submittedAt).toLocaleDateString('fr-FR'), completed: true },
    { status: 'Vérification des pièces', description: 'Vérification de vos documents en cours', date: new Date(request.submittedAt).toLocaleDateString('fr-FR'), completed: true },
    { status: 'Analyse du dossier', description: 'Évaluation de votre dossier', date: new Date(request.updatedAt).toLocaleDateString('fr-FR'), completed: request.status !== 'pending' },
    {
      status: 'Décision',
      description: request.status === 'approved' ? 'Votre demande a été acceptée.' : request.status === 'rejected' ? 'Demande refusée' : request.status === 'guarantees_required' ? 'Garanties supplémentaires demandées' : 'Décision en attente',
      date: new Date(request.updatedAt).toLocaleDateString('fr-FR'),
      completed: request.status !== 'pending',
    },
  ];

  const statusLabel = request.status === 'approved' ? 'Approuvé' : request.status === 'pending' ? 'En attente' : request.status === 'rejected' ? 'Refusé' : 'Garanties requises';
  const docs = Array.isArray(request.documents) ? request.documents : [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Demande #{request.id.slice(0, 8)}</h1>
        <p className="text-gray-600 mt-1">Déposée le {new Date(request.submittedAt).toLocaleDateString('fr-FR')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Détails de la demande</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Montant</p>
                <p className="text-lg font-semibold text-gray-900">{Number(request.amount).toLocaleString()} TND</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Durée</p>
                <p className="text-lg font-semibold text-gray-900">{request.duration} mois ({Math.round(request.duration / 12)} ans)</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenu mensuel</p>
                <p className="text-lg font-semibold text-gray-900">{Number(request.monthlyIncome).toLocaleString()} TND</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Profession</p>
                <p className="text-lg font-semibold text-gray-900">{request.profession}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Statut</p>
                <p className="text-lg font-semibold text-gray-900">{statusLabel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Score</p>
                <div className="mt-1"><ScoreBadge score={request.score} category={request.scoreCategory} size="lg" /></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Analyse du score</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Stabilité des revenus</span>
                  <span className="text-sm font-semibold text-gray-900">92/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Taux d&apos;endettement</span>
                  <span className="text-sm font-semibold text-gray-900">78/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Complétude des pièces</span>
                  <span className="text-sm font-semibold text-gray-900">85/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Historique de crédit</span>
                  <span className="text-sm font-semibold text-gray-900">88/100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: '88%' }} /></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Documents déposés</h2>
            <div className="space-y-3">
              {docs.length > 0 ? docs.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📄</span>
                    <span className="font-medium text-gray-900">{doc}</span>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Voir</button>
                </div>
              )) : (
                <p className="text-gray-500 text-sm">Aucun document listé.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <QRCodeCard requestId={request.id} locale="fr" />
          <StatusTimeline events={timelineEvents} locale="fr" />
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">Contacter le support</button>
              <button className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 font-medium">Télécharger le PDF</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
