'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import DataTable from '@/components/DataTable';
import StepForm from '@/components/StepForm';
import FileUpload from '@/components/FileUpload';
import type { CreditRequest } from '@/lib/mockData';
import { validateStep, CIN_MAX_LENGTH, type RequestFormData } from '@/lib/creditRequestValidation';

function requestToFormData(r: CreditRequest): RequestFormData {
  const parts = (r.clientName || '').trim().split(/\s+/);
  const firstName = parts[0] ?? '';
  const lastName = parts.slice(1).join(' ') ?? '';
  return {
    firstName,
    lastName,
    dateOfBirth: '',
    cin: '',
    phone: '',
    email: r.clientEmail ?? '',
    employmentStatus: r.employmentStatus ?? '',
    profession: r.profession ?? '',
    employer: r.employer ?? '',
    yearsExperience: r.yearsExperience != null ? String(r.yearsExperience) : '',
    workAddress: r.workAddress ?? '',
    monthlyIncome: r.monthlyIncome != null ? String(r.monthlyIncome) : '',
    additionalIncome: r.additionalIncome != null ? String(r.additionalIncome) : '0',
    rentMortgage: r.rentMortgage != null ? String(r.rentMortgage) : '0',
    otherCharges: r.otherCharges != null ? String(r.otherCharges) : '0',
    existingLoans: r.existingLoans ?? '',
    loanPayment: r.loanPayment != null ? String(r.loanPayment) : '0',
    creditAmount: r.amount != null ? String(r.amount) : '',
    duration: r.duration != null ? String(r.duration) : '',
    creditPurpose: r.creditPurpose ?? '',
    guaranteeType: r.guaranteeType ?? '',
    notes: r.notes ?? '',
  };
}

export default function ClientRequests() {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('');
  const [amountFilter, setAmountFilter] = useState<string>('');
  const [editingRequest, setEditingRequest] = useState<CreditRequest | null>(null);
  const [formData, setFormData] = useState<RequestFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [documentFiles, setDocumentFiles] = useState<Record<string, File[]>>({});
  const [existingFiles, setExistingFiles] = useState<string[]>([]);
  const [openingEdit, setOpeningEdit] = useState(false);

  const fetchRequests = useCallback(() => {
    setLoading(true);
    fetch('/api/credit-requests')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleDelete = useCallback(
    async (request: CreditRequest) => {
      if (!request?.id) return;
      if (typeof window !== 'undefined' && !window.confirm('Supprimer cette demande ?')) return;
      const res = await fetch(`/api/credit-requests/${request.id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) setRequests((prev) => prev.filter((r) => r.id !== request.id));
      else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Impossible de supprimer');
      }
    },
    []
  );

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

  const closeEditModal = () => {
    setEditingRequest(null);
    setFormData(null);
    setErrors({});
    setSubmitError('');
    setDocumentFiles({});
    setSubmitting(false);
    setExistingFiles([]);
    setOpeningEdit(false);
  };

  const openEditModal = async (request: CreditRequest) => {
    if (request.status !== 'pending') {
      if (typeof window !== 'undefined') {
        window.alert('Seules les demandes en attente peuvent être modifiées.');
      }
      return;
    }
    setOpeningEdit(true);
    setSubmitError('');
    setErrors({});
    setDocumentFiles({});

    try {
      const [reqRes, docRes] = await Promise.all([
        fetch(`/api/credit-requests/${request.id}`, { credentials: 'include' }),
        fetch(`/api/credit-requests/${request.id}/documents`, { credentials: 'include' }),
      ]);

      const reqData = reqRes.ok ? ((await reqRes.json()) as CreditRequest) : request;
      const docData = docRes.ok ? await docRes.json() : { files: [] };

      setEditingRequest(reqData);
      setFormData(requestToFormData(reqData));
      setExistingFiles(Array.isArray(docData?.files) ? docData.files : []);
    } catch {
      setEditingRequest(request);
      setFormData(requestToFormData(request));
      setExistingFiles([]);
    } finally {
      setOpeningEdit(false);
    }
  };

  const steps = ['État civil', 'Professionnel', 'Revenus et charges', 'Détails du crédit', 'Documents'];

  const update = (key: keyof RequestFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((f) => (f ? { ...f, [key]: e.target.value } : f));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: '' }));
  };

  const validateCurrentStep = (stepIndex: number): boolean => {
    if (!formData) return false;
    const stepErrors = validateStep(formData, stepIndex);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const onDocumentFiles = (key: string) => (files: File[]) => {
    setDocumentFiles((prev) => ({ ...prev, [key]: files }));
  };

  const handleEditSubmit = async () => {
    if (!editingRequest?.id || !formData) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        profession: formData.profession,
        employmentStatus: formData.employmentStatus,
        employer: formData.employer,
        yearsExperience: formData.yearsExperience,
        workAddress: formData.workAddress,
        monthlyIncome: formData.monthlyIncome,
        additionalIncome: formData.additionalIncome,
        rentMortgage: formData.rentMortgage,
        otherCharges: formData.otherCharges,
        existingLoans: formData.existingLoans,
        loanPayment: formData.loanPayment,
        creditAmount: formData.creditAmount,
        duration: formData.duration,
        creditPurpose: formData.creditPurpose,
        guaranteeType: formData.guaranteeType,
        notes: formData.notes,
      };

      const res = await fetch(`/api/credit-requests/${editingRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }

      const allFiles = Object.values(documentFiles).flat();
      if (allFiles.length > 0) {
        const form = new FormData();
        allFiles.forEach((f) => form.append('files', f));
        await fetch(`/api/credit-requests/${editingRequest.id}/documents`, {
          method: 'POST',
          body: form,
          credentials: 'include',
        });
      }

      closeEditModal();
      fetchRequests();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Erreur lors de la modification');
    } finally {
      setSubmitting(false);
    }
  };

  const err = (key: string) => errors[key];
  const inputClass = (key: string) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${err(key) ? 'border-red-500' : 'border-gray-300'}`;
  const downloadUrl = (requestId: string, fileName: string) =>
    `/api/credit-requests/${requestId}/documents?file=${encodeURIComponent(fileName)}`;

  const handleRemoveExistingFile = async (fileName: string) => {
    if (!editingRequest?.id) return;
    const ok = typeof window === 'undefined' ? true : window.confirm(`Supprimer le fichier "${fileName}" ?`);
    if (!ok) return;

    const res = await fetch(
      `/api/credit-requests/${editingRequest.id}/documents?file=${encodeURIComponent(fileName)}`,
      { method: 'DELETE', credentials: 'include' }
    );
    if (res.ok) {
      setExistingFiles((prev) => prev.filter((f) => f !== fileName));
    } else {
      const errData = await res.json().catch(() => ({}));
      setSubmitError(errData.error || 'Impossible de supprimer ce fichier.');
    }
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
            editPrefix="/client/request"
            onEdit={openEditModal}
            onDelete={handleDelete}
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

      {(editingRequest || openingEdit) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fermer la modal"
            className="absolute inset-0 bg-black/40"
            onClick={closeEditModal}
          />
          <div className="relative z-10 w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl bg-gray-50 p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Modifier la demande</h2>
                <p className="text-gray-600 mt-1">Mêmes étapes que la création de demande.</p>
              </div>
              <button type="button" onClick={closeEditModal} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                Fermer
              </button>
            </div>

            {submitError && <p className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{submitError}</p>}
            {openingEdit || !formData ? (
              <p className="text-gray-600 py-8">Chargement des données actuelles...</p>
            ) : (
              <StepForm steps={steps} onSubmit={handleEditSubmit} locale="fr" submitDisabled={submitting} freeNavigation submitLabel={submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                    <input type="text" value={formData.firstName ?? ''} onChange={update('firstName')} className={inputClass('firstName')} placeholder="Sirine" />
                    {err('firstName') && <p className="text-red-500 text-sm mt-1">{err('firstName')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                    <input type="text" value={formData.lastName ?? ''} onChange={update('lastName')} className={inputClass('lastName')} placeholder="Nciri" />
                    {err('lastName') && <p className="text-red-500 text-sm mt-1">{err('lastName')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                    <input type="date" value={formData.dateOfBirth ?? ''} onChange={update('dateOfBirth')} className={inputClass('dateOfBirth')} />
                    {err('dateOfBirth') && <p className="text-red-500 text-sm mt-1">{err('dateOfBirth')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIN (carte d&apos;identité nationale)</label>
                    <input type="text" value={formData.cin ?? ''} onChange={update('cin')} className={inputClass('cin')} placeholder="Ex. 12345678" maxLength={CIN_MAX_LENGTH} />
                    {err('cin') && <p className="text-red-500 text-sm mt-1">{err('cin')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone (Tunisie)</label>
                    <input type="tel" value={formData.phone ?? ''} onChange={update('phone')} className={inputClass('phone')} placeholder="+216 XX XXX XXX" />
                    {err('phone') && <p className="text-red-500 text-sm mt-1">{err('phone')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                    <input type="email" value={formData.email ?? ''} onChange={update('email')} className={inputClass('email')} placeholder="sirine.nciri@exemple.com" />
                    {err('email') && <p className="text-red-500 text-sm mt-1">{err('email')}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Situation professionnelle</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Situation</label>
                    <select value={formData.employmentStatus ?? ''} onChange={update('employmentStatus')} className={inputClass('employmentStatus')}>
                      <option value="">Choisir</option>
                      <option value="Salarié(e)">Salarié(e)</option>
                      <option value="Indépendant(e)">Indépendant(e)</option>
                      <option value="Sans emploi">Sans emploi</option>
                      <option value="Retraité(e)">Retraité(e)</option>
                    </select>
                    {err('employmentStatus') && <p className="text-red-500 text-sm mt-1">{err('employmentStatus')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                    <input type="text" value={formData.profession ?? ''} onChange={update('profession')} className={inputClass('profession')} placeholder="Ingénieur informatique" />
                    {err('profession') && <p className="text-red-500 text-sm mt-1">{err('profession')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employeur</label>
                    <input type="text" value={formData.employer ?? ''} onChange={update('employer')} className={inputClass('employer')} placeholder="Nom de l&apos;entreprise" />
                    {err('employer') && <p className="text-red-500 text-sm mt-1">{err('employer')}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse professionnelle</label>
                    <input type="text" value={formData.workAddress ?? ''} onChange={update('workAddress')} className={inputClass('workAddress')} placeholder="Rue, ville, code postal" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenus et charges (TND)</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Revenu net mensuel (TND) *</label>
                    <input type="number" min={0} step={100} value={formData.monthlyIncome ?? ''} onChange={update('monthlyIncome')} className={inputClass('monthlyIncome')} placeholder="15000" />
                    {err('monthlyIncome') && <p className="text-red-500 text-sm mt-1">{err('monthlyIncome')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Autres revenus (TND)</label>
                    <input type="number" min={0} step={100} value={formData.additionalIncome ?? ''} onChange={update('additionalIncome')} className={inputClass('additionalIncome')} placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loyer / Prêt (TND/mois)</label>
                    <input type="number" min={0} value={formData.rentMortgage ?? ''} onChange={update('rentMortgage')} className={inputClass('rentMortgage')} placeholder="3000" />
                    {err('rentMortgage') && <p className="text-red-500 text-sm mt-1">{err('rentMortgage')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Autres charges mensuelles (TND)</label>
                    <input type="number" min={0} value={formData.otherCharges ?? ''} onChange={update('otherCharges')} className={inputClass('otherCharges')} placeholder="2000" />
                    {err('otherCharges') && <p className="text-red-500 text-sm mt-1">{err('otherCharges')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Crédits en cours</label>
                    <select value={formData.existingLoans ?? ''} onChange={update('existingLoans')} className={inputClass('existingLoans')}>
                      <option value="">Choisir</option>
                      <option value="Aucun">Aucun crédit en cours</option>
                      <option value="1">1 crédit</option>
                      <option value="2">2 crédits</option>
                      <option value="3+">3 crédits ou plus</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mensualité des crédits (TND)</label>
                    <input type="number" min={0} value={formData.loanPayment ?? ''} onChange={update('loanPayment')} className={inputClass('loanPayment')} placeholder="0" />
                    {err('loanPayment') && <p className="text-red-500 text-sm mt-1">{err('loanPayment')}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails du crédit (TND)</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Montant demandé (TND) *</label>
                    <input type="number" min={0} step={1000} value={formData.creditAmount ?? ''} onChange={update('creditAmount')} className={inputClass('creditAmount')} placeholder="250000" />
                    {err('creditAmount') && <p className="text-red-500 text-sm mt-1">{err('creditAmount')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Durée (mois) *</label>
                    <input type="number" min={12} max={300} value={formData.duration ?? ''} onChange={update('duration')} className={inputClass('duration')} placeholder="120" />
                    {err('duration') && <p className="text-red-500 text-sm mt-1">{err('duration')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Objet du crédit</label>
                    <select value={formData.creditPurpose ?? ''} onChange={update('creditPurpose')} className={inputClass('creditPurpose')}>
                      <option value="">Choisir</option>
                      <option value="Achat immobilier">Achat immobilier</option>
                      <option value="Achat véhicule">Achat véhicule</option>
                      <option value="Travaux / rénovation">Travaux / rénovation</option>
                      <option value="Projet professionnel">Projet professionnel</option>
                      <option value="Études">Études</option>
                      <option value="Autre">Autre</option>
                    </select>
                    {err('creditPurpose') && <p className="text-red-500 text-sm mt-1">{err('creditPurpose')}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type de garantie</label>
                    <select value={formData.guaranteeType ?? ''} onChange={update('guaranteeType')} className={inputClass('guaranteeType')}>
                      <option value="">Choisir</option>
                      <option value="Immobilier">Immobilier</option>
                      <option value="Véhicule">Véhicule</option>
                      <option value="Virement de salaire">Virement de salaire</option>
                      <option value="Caution personnelle">Caution personnelle</option>
                      <option value="Aucune">Aucune</option>
                    </select>
                    {err('guaranteeType') && <p className="text-red-500 text-sm mt-1">{err('guaranteeType')}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Informations complémentaires</label>
                    <textarea rows={4} value={formData.notes ?? ''} onChange={update('notes')} className={inputClass('notes')} placeholder="Précisions éventuelles..." />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Téléverser les pièces</h2>
                {existingFiles.length > 0 && editingRequest?.id && (
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-sm font-semibold text-gray-800 mb-3">Fichiers déjà uploadés</p>
                    <ul className="space-y-2">
                      {existingFiles.map((fileName) => (
                        <li key={fileName} className="flex items-center justify-between gap-3 rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
                          <span className="truncate text-gray-700">{fileName}</span>
                          <span className="shrink-0 flex items-center gap-3">
                            <a
                              href={downloadUrl(editingRequest.id, fileName)}
                              className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Télécharger
                            </a>
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingFile(fileName)}
                              className="text-red-600 hover:text-red-800 font-medium"
                            >
                              Supprimer
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <FileUpload label="CIN (recto et verso)" accept="image/*" onFilesChange={onDocumentFiles('cin')} />
                <FileUpload label="Bulletins de salaire (3 derniers mois)" accept=".pdf,.doc,.docx" multiple onFilesChange={onDocumentFiles('paySlips')} />
                <FileUpload label="Relevés bancaires (6 derniers mois)" accept=".pdf" multiple onFilesChange={onDocumentFiles('bankStatements')} />
                <FileUpload label="Justificatif de domicile" accept=".pdf,image/*" onFilesChange={onDocumentFiles('domicile')} />
                <FileUpload label="Autres pièces (optionnel)" accept="*" multiple onFilesChange={onDocumentFiles('other')} />
              </div>
              </StepForm>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
