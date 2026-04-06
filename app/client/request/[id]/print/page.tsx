'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { CreditRequest } from '@/lib/mockData';
import { describeGuaranteeForDisplay } from '@/lib/guaranteeTypes';

function formatTND(n: number): string {
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' TND';
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function RequestPrintPage() {
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
      <div className="min-h-screen p-8">
        <p className="text-gray-500">Chargement…</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen p-8">
        <p className="text-gray-500">Dossier introuvable.</p>
        <Link href="/client/requests" className="text-blue-600 hover:underline mt-2 inline-block">Retour</Link>
      </div>
    );
  }

  const statusLabel =
    request.status === 'approved'
      ? 'Approuvé'
      : request.status === 'pending'
        ? 'En attente'
        : request.status === 'rejected'
          ? 'Refusé'
          : 'Garanties requises';

  return (
    <div className="max-w-3xl mx-auto p-6 print:p-0 print:max-w-none">
      <div className="hidden print:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 py-2 px-4 text-center text-sm text-gray-500">
        CreditPro Tunisie · Récapitulatif dossier {request.id.slice(0, 8).toUpperCase()} · {formatDate(request.updatedAt)}
      </div>

      <p className="print:hidden mb-6 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm">
        Utilisez <kbd className="px-1.5 py-0.5 bg-white rounded border">Ctrl+P</kbd> (ou <kbd className="px-1.5 py-0.5 bg-white rounded border">Cmd+P</kbd> sur Mac) pour imprimer ou enregistrer en PDF.
      </p>

      <div className="bg-white print:bg-white">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CreditPro Tunisie</h1>
          <p className="text-gray-600">Récapitulatif de la demande de crédit</p>
          <p className="text-sm text-gray-500 mt-2">Dossier {request.id.slice(0, 8).toUpperCase()} · Déposé le {formatDate(request.submittedAt)}</p>
          <p className="mt-2">
            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
              request.status === 'approved' ? 'bg-green-100 text-green-800' :
              request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
              request.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
            }`}>
              {statusLabel}
            </span>
          </p>
        </div>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Résumé</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Montant :</span> <span className="font-medium">{formatTND(request.amount)}</span></div>
            <div><span className="text-gray-500">Durée :</span> <span className="font-medium">{request.duration} mois</span></div>
            <div><span className="text-gray-500">Objet :</span> <span className="font-medium">{request.creditPurpose || '—'}</span></div>
            <div className="col-span-2"><span className="text-gray-500">Garantie :</span> <span className="font-medium">{describeGuaranteeForDisplay(request.guaranteeType) || '—'}</span></div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Demandeur</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Nom :</span> <span className="font-medium">{request.clientName}</span></div>
            <div><span className="text-gray-500">E-mail :</span> <span className="font-medium">{request.clientEmail}</span></div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Situation professionnelle</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Profession :</span> <span className="font-medium">{request.profession || '—'}</span></div>
            <div><span className="text-gray-500">Employeur :</span> <span className="font-medium">{request.employer || '—'}</span></div>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Revenus et charges (TND)</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Revenu mensuel :</span> <span className="font-medium">{formatTND(request.monthlyIncome)}</span></div>
            {request.additionalIncome != null && request.additionalIncome > 0 && (
              <div><span className="text-gray-500">Autres revenus :</span> <span className="font-medium">{formatTND(request.additionalIncome)}</span></div>
            )}
          </div>
        </section>

        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
          Document généré le {new Date().toLocaleDateString('fr-FR')} · CreditPro Tunisie
        </div>
      </div>

      <p className="print:hidden mt-8 text-center">
        <Link href={`/client/request/${id}`} className="text-blue-600 hover:underline">Retour au dossier</Link>
      </p>
    </div>
  );
}
