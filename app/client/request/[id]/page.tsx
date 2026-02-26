'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ScoreBadge from '@/components/ScoreBadge';
import StatusTimeline from '@/components/StatusTimeline';
import type { CreditRequest } from '@/lib/mockData';

function formatTND(n: number): string {
  return Number(n).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' TND';
}

function formatDate(s: string): string {
  return new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(s: string): string {
  const d = new Date(s);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function LabelValue({ label, value, hideIfEmpty, className = '' }: { label: string; value: React.ReactNode; hideIfEmpty?: boolean; className?: string }) {
  if (hideIfEmpty && (value == null || value === '')) return null;
  return (
    <div className={className}>
      <p className="text-sm text-gray-500 mb-0.5">{label}</p>
      <p className="text-gray-900 font-medium">{value ?? '—'}</p>
    </div>
  );
}

export default function ClientRequestDetail() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [request, setRequest] = useState<CreditRequest | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/credit-requests/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/credit-requests/${id}/documents`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : { files: [] })),
    ])
      .then(([req, docRes]) => {
        setRequest(req ?? null);
        setUploadedFiles(Array.isArray(docRes?.files) ? docRes.files : []);
      })
      .catch(() => {
        setRequest(null);
        setUploadedFiles([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-100 rounded w-1/4" />
          <div className="h-48 bg-gray-100 rounded" />
        </div>
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

  const statusLabel =
    request.status === 'approved'
      ? 'Approuvé'
      : request.status === 'pending'
        ? 'En attente'
        : request.status === 'rejected'
          ? 'Refusé'
          : 'Garanties requises';
  const statusClass =
    request.status === 'approved'
      ? 'bg-green-100 text-green-800'
      : request.status === 'pending'
        ? 'bg-amber-100 text-amber-800'
        : request.status === 'rejected'
          ? 'bg-red-100 text-red-800'
          : 'bg-orange-100 text-orange-800';

  const timelineEvents = [
    { status: 'Dossier déposé', description: 'Votre demande a été enregistrée dans notre système.', date: formatDateTime(request.submittedAt), completed: true },
    { status: 'Vérification des pièces', description: 'Examen des documents transmis.', date: formatDateTime(request.submittedAt), completed: true },
    { status: 'Analyse du dossier', description: request.status !== 'pending' ? 'Évaluation effectuée.' : 'Évaluation en cours.', date: formatDateTime(request.updatedAt), completed: request.status !== 'pending' },
    {
      status: 'Décision',
      description:
        request.status === 'approved'
          ? 'Votre demande a été acceptée.'
          : request.status === 'rejected'
            ? 'Demande refusée. Contactez le support pour plus d\'informations.'
            : request.status === 'guarantees_required'
              ? 'Garanties ou pièces complémentaires demandées.'
              : 'Décision en attente.',
      date: formatDateTime(request.updatedAt),
      completed: request.status !== 'pending',
    },
  ];

  const hasNotes = request.notes != null && String(request.notes).trim() !== '';
  const downloadUrl = (fileName: string) => `/api/credit-requests/${request.id}/documents?file=${encodeURIComponent(fileName)}`;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Link href="/client/requests" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block">← Retour aux demandes</Link>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dossier {request.id.slice(0, 8).toUpperCase()}</h1>
          <p className="text-gray-500 mt-1">
            Déposé le {formatDate(request.submittedAt)} · Dernière mise à jour le {formatDate(request.updatedAt)}
          </p>
        </div>
        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${statusClass}`}>
          {statusLabel}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Résumé crédit */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Résumé de la demande</h2>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <LabelValue label="Montant demandé" value={formatTND(request.amount)} />
                <LabelValue label="Durée" value={`${request.duration} mois (${Math.round(request.duration / 12)} an(s))`} />
                <LabelValue label="Objet du crédit" value={request.creditPurpose} hideIfEmpty />
                <LabelValue label="Type de garantie" value={request.guaranteeType} hideIfEmpty />
                <LabelValue label="Score" value={<ScoreBadge score={request.score} category={request.scoreCategory} size="md" />} />
              </div>
            </div>
          </section>

          {/* Indicateurs de scoring */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Indicateurs de scoring</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-8 mb-6">
                <div className="flex items-center gap-4">
                  <ScoreBadge score={request.score} category={request.scoreCategory} size="lg" />
                  <div>
                    <p className="text-sm text-gray-500">Score global</p>
                    <p className="text-xs text-gray-600 max-w-[200px]">
                      {request.scoreCategory === 'high'
                        ? 'Profil favorable pour l\'octroi de crédit.'
                        : request.scoreCategory === 'medium'
                          ? 'Profil correct ; des garanties peuvent être demandées.'
                          : 'Profil à risque ; compléments ou garanties requis.'}
                    </p>
                  </div>
                </div>
                <div className="h-16 w-px bg-gray-200 hidden sm:block" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Revenu mensuel</p>
                    <p className="font-semibold text-gray-900">{formatTND(request.monthlyIncome)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Charges mensuelles</p>
                    <p className="font-semibold text-gray-900">
                      {formatTND((request.rentMortgage ?? 0) + (request.otherCharges ?? 0) + (request.loanPayment ?? 0))}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Taux d&apos;endettement</p>
                    <p className="font-semibold text-gray-900">
                      {request.monthlyIncome > 0
                        ? Math.round(((request.rentMortgage ?? 0) + (request.otherCharges ?? 0) + (request.loanPayment ?? 0)) / request.monthlyIncome * 100) + ' %'
                        : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Montant / 100</p>
                    <p className="font-semibold text-gray-900">{request.score}/100</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Le score est calculé à partir de votre situation professionnelle, de vos revenus et de votre capacité d&apos;endettement. 
                  Il guide l&apos;instruction du dossier et les conditions d&apos;octroi.
                </p>
              </div>
            </div>
          </section>

          {/* Demandeur */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Demandeur</h2>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <LabelValue label="Nom complet" value={request.clientName} />
                <LabelValue label="E-mail" value={request.clientEmail} />
              </div>
            </div>
          </section>

          {/* Situation professionnelle */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Situation professionnelle</h2>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <LabelValue label="Profession" value={request.profession} />
                <LabelValue label="Employeur" value={request.employer} hideIfEmpty />
                <LabelValue label="Situation" value={request.employmentStatus} hideIfEmpty />
                <LabelValue label="Années d'expérience" value={request.yearsExperience != null ? String(request.yearsExperience) : undefined} hideIfEmpty />
                <LabelValue label="Adresse professionnelle" value={request.workAddress} hideIfEmpty className="sm:col-span-2" />
              </div>
            </div>
          </section>

          {/* Revenus et charges */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Revenus et charges (TND)</h2>
            </div>
            <div className="p-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <LabelValue label="Revenu mensuel" value={formatTND(request.monthlyIncome)} />
                <LabelValue label="Autres revenus" value={request.additionalIncome != null && request.additionalIncome > 0 ? formatTND(request.additionalIncome) : undefined} hideIfEmpty />
                <LabelValue label="Loyer / prêt" value={request.rentMortgage != null && request.rentMortgage > 0 ? formatTND(request.rentMortgage) : undefined} hideIfEmpty />
                <LabelValue label="Autres charges" value={request.otherCharges != null && request.otherCharges > 0 ? formatTND(request.otherCharges) : undefined} hideIfEmpty />
                <LabelValue label="Crédits en cours" value={request.existingLoans} hideIfEmpty />
                <LabelValue label="Mensualité des crédits" value={request.loanPayment != null && request.loanPayment > 0 ? formatTND(request.loanPayment) : undefined} hideIfEmpty />
              </div>
            </div>
          </section>

          {/* Notes */}
          {hasNotes && (
            <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Informations complémentaires</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 whitespace-pre-wrap">{request.notes}</p>
              </div>
            </section>
          )}

          {/* Documents */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Documents déposés</h2>
            </div>
            <div className="p-6">
              {uploadedFiles.length > 0 ? (
                <ul className="space-y-2">
                  {uploadedFiles.map((fileName) => (
                    <li
                      key={fileName}
                      className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <span className="font-medium text-gray-800 truncate mr-3" title={fileName}>
                        {fileName}
                      </span>
                      <a
                        href={downloadUrl(fileName)}
                        download={fileName}
                        className="shrink-0 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Télécharger
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">Aucun document téléversé pour ce dossier.</p>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Suivi de votre dossier</h3>
            <p className="text-sm text-gray-500 mb-3">Sans ouvrir de session, entrez ce numéro sur la page d&apos;accueil dans la section « Suivi de mon crédit » pour voir le statut.</p>
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Numéro de dossier</p>
              <p className="font-mono text-xl font-bold text-gray-900 tracking-wider">
                {(request.trackingCode ?? request.id.slice(0, 8)).toUpperCase()}
              </p>
            </div>
          </div>
          <StatusTimeline
            events={timelineEvents}
            locale="fr"
            subtitle={`Déposé le ${formatDate(request.submittedAt)} · Dernière mise à jour le ${formatDate(request.updatedAt)}`}
          />
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Contacter le support</p>
                <a
                  href="mailto:contact@creditpro.tn"
                  className="block text-blue-600 hover:underline font-medium"
                >
                  contact@creditpro.tn
                </a>
                <a
                  href="tel:+21700000000"
                  className="block text-blue-600 hover:underline font-medium mt-1"
                >
                  +216 70 000 000
                </a>
              </div>
              <a
                href={`/api/credit-requests/${request.id}/pdf`}
                download={`dossier-${request.id.slice(0, 8)}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-200 font-medium"
              >
                Télécharger le récapitulatif (PDF)
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
