'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ScoreBadge from '@/components/ScoreBadge';
import StatusTimeline from '@/components/StatusTimeline';
import RequestChat from '@/components/RequestChat';
import type { CreditRequest } from '@/lib/mockData';
import { describeGuaranteeForDisplay } from '@/lib/guaranteeTypes';
import {
  computeCreditScoring,
  type CreditScoringResult,
  SCORING_ANNUAL_RATE_INDICATIVE,
  SCORING_DOCUMENTATION_FR,
} from '@/lib/creditScoring';

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
      <div className="text-gray-900 font-medium">{value ?? '—'}</div>
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

  const scoring = useMemo(() => {
    if (!request) return null;
    return computeCreditScoring({
      monthlyIncome: Number(request.monthlyIncome) || 0,
      additionalIncome: Number(request.additionalIncome) || 0,
      rentMortgage: Number(request.rentMortgage) || 0,
      otherCharges: Number(request.otherCharges) || 0,
      loanPayment: Number(request.loanPayment) || 0,
      creditAmount: Number(request.amount) || 0,
      durationMonths: Number(request.duration) || 0,
    });
  }, [request]);

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

  const sc: CreditScoringResult = scoring ?? computeCreditScoring({
    monthlyIncome: Number(request.monthlyIncome) || 0,
    additionalIncome: Number(request.additionalIncome) || 0,
    rentMortgage: Number(request.rentMortgage) || 0,
    otherCharges: Number(request.otherCharges) || 0,
    loanPayment: Number(request.loanPayment) || 0,
    creditAmount: Number(request.amount) || 0,
    durationMonths: Number(request.duration) || 0,
  });

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
                <LabelValue label="Type de garantie" value={describeGuaranteeForDisplay(request.guaranteeType)} hideIfEmpty />
                <LabelValue
                  label="Score"
                  value={<ScoreBadge score={sc.totalScore} category={sc.category} size="md" />}
                />
              </div>
            </div>
          </section>

          {/* Scoring détaillé */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Score et capacité financière</h2>
              <p className="text-sm text-gray-600 mt-1">
                Calcul objectif sur 100 — revenus, charges, endettement et poids du crédit demandé. La profession n’entre pas dans le calcul.
              </p>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-start gap-6">
                <ScoreBadge score={sc.totalScore} category={sc.category} size="lg" />
                <div className="flex-1 min-w-[200px]">
                  <p className="text-sm font-medium text-gray-900">Interprétation</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {sc.category === 'high'
                      ? 'Profil favorable : revenus et capacité d’endettement cohérents avec la demande.'
                      : sc.category === 'medium'
                        ? 'Profil intermédiaire : le dossier peut nécessiter des garanties ou des précisions.'
                        : 'Profil plus contraint : charges ou montant demandé élevés par rapport aux revenus déclarés.'}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Revenu net principal / mois</p>
                  <p className="font-semibold text-gray-900">{formatTND(request.monthlyIncome)}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Autres revenus / mois</p>
                  <p className="font-semibold text-gray-900">{formatTND(request.additionalIncome ?? 0)}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Charges fixes (hors nouveau crédit)</p>
                  <p className="font-semibold text-gray-900">{formatTND(sc.fixedMonthlyCharges)}</p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-slate-50 px-4 py-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Mensualité estimée (nouveau crédit)</p>
                  <p className="font-semibold text-gray-900">{formatTND(sc.estimatedNewMonthlyPayment)}</p>
                  <p className="text-[10px] text-gray-500 mt-1 leading-tight">
                    Hypothèse : taux annuel indicatif {(SCORING_ANNUAL_RATE_INDICATIVE * 100).toFixed(0)} %, durée {request.duration} mois (non contractuel).
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/60 px-4 py-3">
                <p className="text-sm font-medium text-gray-900">Taux d’endettement retenu pour le score</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">
                  {sc.debtRatioAfterNewLoanPercent != null ? `${sc.debtRatioAfterNewLoanPercent} %` : '—'}
                </p>
                <p className="text-xs text-gray-600 mt-2">
                  Formule : (charges fixes + mensualité estimée du nouveau crédit) ÷ (revenu principal + autres revenus). Référence courante : rester sous 40 %.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Détail des points (sur 100)</h3>
                <ul className="space-y-4">
                  {sc.components.map((c) => (
                    <li key={c.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50/80">
                      <div className="flex flex-wrap justify-between gap-2 items-center mb-2">
                        <span className="font-medium text-gray-900">{c.title}</span>
                        <span className="text-sm font-semibold text-blue-800">
                          {c.points} / {c.maxPoints} pts
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-2">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all"
                          style={{ width: `${c.maxPoints > 0 ? Math.min(100, (c.points / c.maxPoints) * 100) : 0}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{c.detailFr}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <details className="group rounded-xl border border-gray-200 bg-white open:bg-gray-50/50">
                <summary className="cursor-pointer list-none px-4 py-3 font-semibold text-gray-900 flex items-center justify-between gap-2">
                  <span>{SCORING_DOCUMENTATION_FR.titre}</span>
                  <span className="text-gray-400 text-sm group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 pt-0 space-y-4 text-sm text-gray-700 border-t border-gray-100">
                  <p className="pt-3 leading-relaxed">{SCORING_DOCUMENTATION_FR.introduction}</p>
                  {SCORING_DOCUMENTATION_FR.blocs.map((b) => (
                    <div key={b.sousTitre}>
                      <h4 className="font-semibold text-gray-900 mb-2">{b.sousTitre}</h4>
                      <ul className="list-disc pl-5 space-y-1.5">
                        {b.textes.map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </details>
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

          {/* Messagerie */}
          <section className="bg-white rounded-xl border border-gray-200 overflow-hidden" id="messages">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Messages avec votre chargé de crédit</h2>
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">Répond sous 24h ouvrées</span>
            </div>
            <RequestChat requestId={request.id} currentRole="client" />
          </section>

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
              {request.status === 'pending' && (
                <Link
                  href={`/client/requests?edit=${request.id}`}
                  className="block w-full text-center bg-amber-50 text-amber-900 border border-amber-200 px-4 py-2.5 rounded-lg hover:bg-amber-100 font-medium"
                >
                  Modifier le dossier (montant, durée, pièces…)
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
