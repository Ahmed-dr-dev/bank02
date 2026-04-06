'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ScoreBadge from '@/components/ScoreBadge';
import RequestChat from '@/components/RequestChat';
import type { CreditRequest } from '@/lib/mockData';
import { describeGuaranteeForDisplay } from '@/lib/guaranteeTypes';

const statusLabel: Record<string, string> = {
  approved: 'Approuvé',
  pending: 'En attente',
  rejected: 'Refusé',
  guarantees_required: 'Garanties requises',
};
const statusClass: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 border-green-300',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  rejected: 'bg-red-100 text-red-800 border-red-300',
  guarantees_required: 'bg-orange-100 text-orange-800 border-orange-300',
};

function LabelVal({ label, value }: { label: string; value: React.ReactNode }) {
  if (value == null || value === '') return null;
  return (
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-gray-900 font-medium">{value}</p>
    </div>
  );
}

function formatTND(n: number) {
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' TND';
}

export default function AgentRequestDetail() {
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [request, setRequest] = useState<CreditRequest | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'approved' | 'rejected' | 'guarantees_required' | 'pending' | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [noteSuccess, setNoteSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'finance' | 'docs' | 'messages'>('details');

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/credit-requests/${id}`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
      fetch(`/api/credit-requests/${id}/documents`, { credentials: 'include' }).then((r) => (r.ok ? r.json() : { files: [] })),
    ])
      .then(([data, docRes]) => {
        setRequest(data ?? null);
        setNoteText(data?.notes ?? '');
        setUploadedFiles(Array.isArray(docRes?.files) ? docRes.files : []);
      })
      .catch(() => { setRequest(null); setUploadedFiles([]); })
      .finally(() => setLoading(false));
  }, [id]);

  const setStatus = async (status: 'approved' | 'rejected' | 'guarantees_required' | 'pending') => {
    if (!id || !request) return;
    setActionLoading(status);
    setConfirmAction(null);
    try {
      const res = await fetch(`/api/credit-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
      if (res.ok) setRequest(await res.json());
      else { const err = await res.json().catch(() => ({})); alert(err.error || 'Erreur'); }
    } finally { setActionLoading(null); }
  };

  const saveNote = async () => {
    if (!id) return;
    setNoteSaving(true);
    try {
      const res = await fetch(`/api/credit-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText }),
        credentials: 'include',
      });
      if (res.ok) {
        setRequest(await res.json());
        setNoteSuccess(true);
        setTimeout(() => setNoteSuccess(false), 2500);
      }
    } finally { setNoteSaving(false); }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-64 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <p className="text-gray-500 mb-2">Dossier introuvable.</p>
        <Link href="/agent/requests" className="text-emerald-600 hover:underline">← Retour</Link>
      </div>
    );
  }

  const income = request.monthlyIncome || 1;
  const monthlyEst = Math.round((request.amount / request.duration) * 1.045);
  const debtRatio = ((monthlyEst / income) * 100).toFixed(1);

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/agent/requests" className="text-emerald-600 hover:underline text-sm font-medium inline-flex items-center gap-1 mb-3">
          ← Retour aux demandes
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Dossier {request.trackingCode ? `#${request.trackingCode}` : `#${request.id.slice(0, 8)}`}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {request.clientName} · Déposé le {new Date(request.submittedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-bold border ${statusClass[request.status] || 'bg-gray-100'}`}>
              {statusLabel[request.status] ?? request.status}
            </span>
            <a
              href={`/api/credit-requests/${id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-slate-700 text-white rounded-xl text-sm font-medium hover:bg-slate-800"
            >
              Télécharger PDF
            </a>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main — tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab bar */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200">
              {(['details', 'finance', 'docs', 'messages'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-3 text-sm font-semibold transition-all ${activeTab === t ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {t === 'details' ? 'Client & Emploi' : t === 'finance' ? 'Crédit & Finances' : t === 'docs' ? 'Documents' : '💬 Messages'}
                </button>
              ))}
            </div>

            <div className={activeTab === 'messages' ? '' : 'p-6'}>
              {activeTab === 'messages' && (
                <RequestChat requestId={id} currentRole="credit_officer" />
              )}

              {activeTab === 'details' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <LabelVal label="Nom complet" value={request.clientName} />
                  <LabelVal label="E-mail" value={request.clientEmail} />
                  <LabelVal label="Profession" value={request.profession} />
                  <LabelVal label="Statut d'emploi" value={request.employmentStatus} />
                  <LabelVal label="Employeur" value={request.employer} />
                  <LabelVal label="Expérience" value={request.yearsExperience != null ? `${request.yearsExperience} ans` : null} />
                  <LabelVal label="Adresse professionnelle" value={request.workAddress} />
                  <LabelVal label="Revenus mensuels" value={request.monthlyIncome ? formatTND(request.monthlyIncome) : null} />
                </div>
              )}

              {activeTab === 'finance' && (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                      <p className="text-xs text-emerald-700 uppercase font-semibold mb-1">Montant demandé</p>
                      <p className="text-3xl font-bold text-emerald-700">{formatTND(request.amount)}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-xs text-slate-600 uppercase font-semibold mb-1">Durée</p>
                      <p className="text-3xl font-bold text-slate-700">{request.duration} mois</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-xs text-blue-700 uppercase font-semibold mb-1">Mensualité estimée</p>
                      <p className="text-2xl font-bold text-blue-700">{formatTND(monthlyEst)}</p>
                    </div>
                    <div className={`p-4 rounded-xl border ${Number(debtRatio) > 40 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                      <p className={`text-xs uppercase font-semibold mb-1 ${Number(debtRatio) > 40 ? 'text-red-700' : 'text-green-700'}`}>Taux d'endettement</p>
                      <p className={`text-2xl font-bold ${Number(debtRatio) > 40 ? 'text-red-700' : 'text-green-700'}`}>{debtRatio} %</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-100 pt-4 grid md:grid-cols-3 gap-4">
                    <LabelVal label="Revenus complémentaires" value={request.additionalIncome ? formatTND(request.additionalIncome) : null} />
                    <LabelVal label="Loyer / Crédit immobilier" value={request.rentMortgage ? formatTND(request.rentMortgage) : null} />
                    <LabelVal label="Autres charges" value={request.otherCharges ? formatTND(request.otherCharges) : null} />
                    <LabelVal label="Prêts existants" value={request.existingLoans} />
                    <LabelVal label="Mensualité prêt existant" value={request.loanPayment ? formatTND(request.loanPayment) : null} />
                    <LabelVal label="Objet du crédit" value={request.creditPurpose} />
                    <LabelVal label="Type de garantie" value={describeGuaranteeForDisplay(request.guaranteeType)} />
                  </div>
                </div>
              )}

              {activeTab === 'docs' && (
                <div>
                  {uploadedFiles.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-4xl mb-3">📂</p>
                      <p>Aucun document téléversé pour ce dossier.</p>
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {uploadedFiles.map((fileName) => {
                        const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
                        const icon = ['pdf'].includes(ext) ? '📕' : ['jpg','jpeg','png','gif','webp'].includes(ext) ? '🖼️' : ['doc','docx'].includes(ext) ? '📝' : '📄';
                        return (
                          <li key={fileName} className="flex items-center justify-between py-3 px-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-emerald-400 transition-all">
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-2xl shrink-0">{icon}</span>
                              <span className="font-medium text-gray-900 truncate" title={fileName}>{fileName}</span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0 ml-3">
                              <a
                                href={`/api/credit-requests/${id}/documents?file=${encodeURIComponent(fileName)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                              >
                                Ouvrir
                              </a>
                              <a
                                href={`/api/credit-requests/${id}/documents?file=${encodeURIComponent(fileName)}`}
                                download={fileName}
                                className="text-slate-600 hover:text-slate-800 text-sm font-medium"
                              >
                                Télécharger
                              </a>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Score analysis */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Analyse du score</h2>
            <div className="flex items-center justify-between mb-5">
              <span className="font-medium text-gray-700">Score global</span>
              <ScoreBadge score={request.score} category={request.scoreCategory} size="lg" />
            </div>
            <div className={`p-5 rounded-xl border ${request.scoreCategory === 'high' ? 'bg-emerald-50 border-emerald-200' : request.scoreCategory === 'medium' ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-sm font-semibold mb-1">
                {request.scoreCategory === 'high' ? 'Profil solide' : request.scoreCategory === 'medium' ? 'Profil modéré' : 'Profil à risque'}
              </p>
              <p className="text-sm text-gray-700">
                {request.scoreCategory === 'high'
                  ? 'Capacité financière solide, risque faible. Approbation recommandée.'
                  : request.scoreCategory === 'medium'
                  ? 'Capacité modérée. Approbation possible avec conditions ou garanties complémentaires.'
                  : 'Risque élevé. Des garanties supplémentaires ou un co-signataire sont recommandés.'}
              </p>
            </div>
          </div>

          {/* Internal note */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-3">Note interne</h2>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              placeholder="Ajouter une note interne sur ce dossier..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
            />
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={saveNote}
                disabled={noteSaving}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {noteSaving ? 'Enregistrement…' : 'Enregistrer la note'}
              </button>
              {noteSuccess && <span className="text-emerald-600 text-sm font-medium">✓ Note sauvegardée</span>}
            </div>
          </div>
        </div>

        {/* Sidebar — decision + status */}
        <div className="space-y-6">
          {/* Current status */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Statut actuel</h3>
            <div className={`p-4 rounded-xl text-center font-bold text-base border ${statusClass[request.status] || 'bg-gray-100'}`}>
              {statusLabel[request.status] ?? request.status}
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Modifié le {new Date(request.updatedAt).toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Decision panel — always visible */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Décision</h3>
            <div className="space-y-2">
              {(['approved', 'guarantees_required', 'rejected', 'pending'] as const).map((s) => {
                const isActive = request.status === s;
                const btnConfig = {
                  approved: { label: '✓ Approuver', bg: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' },
                  guarantees_required: { label: '⚠ Garanties requises', bg: 'from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600' },
                  rejected: { label: '✗ Refuser', bg: 'from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700' },
                  pending: { label: '↩ Remettre en attente', bg: 'from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700' },
                }[s];
                return (
                  <button
                    key={s}
                    disabled={isActive || !!actionLoading}
                    onClick={() => setConfirmAction(s)}
                    className={`w-full bg-gradient-to-r ${btnConfig.bg} text-white px-4 py-3 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all`}
                  >
                    {isActive ? `✓ ${btnConfig.label.replace(/^[✓⚠✗↩]\s/, '')} (actuel)` : btnConfig.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick info summary */}
          <div className="bg-slate-800 rounded-2xl p-6 text-white">
            <h3 className="text-sm font-bold text-slate-300 uppercase mb-4">Résumé rapide</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Montant</span>
                <span className="font-semibold">{formatTND(request.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Durée</span>
                <span className="font-semibold">{request.duration} mois</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mensualité</span>
                <span className="font-semibold">{formatTND(monthlyEst)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Taux d'endet.</span>
                <span className={`font-semibold ${Number(debtRatio) > 40 ? 'text-red-400' : 'text-green-400'}`}>{debtRatio} %</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Score</span>
                <span className={`font-semibold ${request.score >= 70 ? 'text-green-400' : request.score >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>{request.score}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirmer la décision</h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir changer le statut en <strong>{statusLabel[confirmAction]}</strong> ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setStatus(confirmAction)}
                disabled={!!actionLoading}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50"
              >
                Confirmer
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
