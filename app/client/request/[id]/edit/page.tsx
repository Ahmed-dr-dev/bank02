'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import StepForm from '@/components/StepForm';
import { validateStep, type RequestFormData } from '@/lib/creditRequestValidation';
import type { CreditRequest } from '@/lib/mockData';

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

export default function EditRequestPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '';
  const [formData, setFormData] = useState<RequestFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`/api/credit-requests/${id}`, { credentials: 'include' })
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Demande introuvable' : 'Erreur');
        return r.json();
      })
      .then((data: CreditRequest) => {
        if (data.status !== 'pending') {
          setLoadError('Seules les demandes en attente peuvent être modifiées.');
          return;
        }
        setFormData(requestToFormData(data));
      })
      .catch(() => setLoadError('Demande introuvable.'));
  }, [id]);

  const update = (key: keyof RequestFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((f) => (f ? { ...f, [key]: e.target.value } : f));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validateCurrentStep = (stepIndex: number): boolean => {
    if (!formData) return false;
    const stepErrors =
      stepIndex === 0
        ? (() => {
            const e: Record<string, string> = {};
            if (!formData.firstName?.trim()) e.firstName = 'Prénom requis';
            if (!formData.lastName?.trim()) e.lastName = 'Nom requis';
            if (!formData.email?.trim()) e.email = 'E-mail requis';
            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'E-mail invalide';
            return e;
          })()
        : validateStep(formData, stepIndex);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!formData || !id) return;
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
      const res = await fetch(`/api/credit-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      router.push(`/client/request/${id}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  const err = (key: string) => errors[key];
  const inputClass = (key: string) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${err(key) ? 'border-red-500' : 'border-gray-300'}`;

  if (loadError) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-red-600 mb-4">{loadError}</p>
        <button type="button" onClick={() => router.push('/client/requests')} className="text-blue-600 hover:underline">
          Retour à mes demandes
        </button>
      </div>
    );
  }

  if (!formData) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Chargement…</div>;
  }

  const steps = ['État civil', 'Professionnel', 'Revenus et charges', 'Détails du crédit'];
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Modifier la demande</h1>
        <p className="text-gray-600 mt-1">Modifiez les champs puis enregistrez (demande en attente uniquement)</p>
      </div>
      {submitError && <p className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{submitError}</p>}
      <StepForm steps={steps} onSubmit={handleSubmit} locale="fr" onValidateStep={validateCurrentStep} submitDisabled={submitting}>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input type="text" value={formData.firstName ?? ''} onChange={update('firstName')} className={inputClass('firstName')} />
              {err('firstName') && <p className="text-red-500 text-sm mt-1">{err('firstName')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input type="text" value={formData.lastName ?? ''} onChange={update('lastName')} className={inputClass('lastName')} />
              {err('lastName') && <p className="text-red-500 text-sm mt-1">{err('lastName')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input type="email" value={formData.email ?? ''} onChange={update('email')} className={inputClass('email')} />
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
              <input type="text" value={formData.profession ?? ''} onChange={update('profession')} className={inputClass('profession')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employeur</label>
              <input type="text" value={formData.employer ?? ''} onChange={update('employer')} className={inputClass('employer')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Années d&apos;expérience</label>
              <input type="number" min={0} max={50} value={formData.yearsExperience ?? ''} onChange={update('yearsExperience')} className={inputClass('yearsExperience')} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse professionnelle</label>
              <input type="text" value={formData.workAddress ?? ''} onChange={update('workAddress')} className={inputClass('workAddress')} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Revenus et charges (TND)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Revenu net mensuel (TND) *</label>
              <input type="number" min={0} step={100} value={formData.monthlyIncome ?? ''} onChange={update('monthlyIncome')} className={inputClass('monthlyIncome')} />
              {err('monthlyIncome') && <p className="text-red-500 text-sm mt-1">{err('monthlyIncome')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Autres revenus (TND)</label>
              <input type="number" min={0} step={100} value={formData.additionalIncome ?? ''} onChange={update('additionalIncome')} className={inputClass('additionalIncome')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loyer / Prêt (TND/mois)</label>
              <input type="number" min={0} value={formData.rentMortgage ?? ''} onChange={update('rentMortgage')} className={inputClass('rentMortgage')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Autres charges mensuelles (TND)</label>
              <input type="number" min={0} value={formData.otherCharges ?? ''} onChange={update('otherCharges')} className={inputClass('otherCharges')} />
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
              <input type="number" min={0} value={formData.loanPayment ?? ''} onChange={update('loanPayment')} className={inputClass('loanPayment')} />
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails du crédit (TND)</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Montant demandé (TND) *</label>
              <input type="number" min={0} step={1000} value={formData.creditAmount ?? ''} onChange={update('creditAmount')} className={inputClass('creditAmount')} />
              {err('creditAmount') && <p className="text-red-500 text-sm mt-1">{err('creditAmount')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Durée (mois) *</label>
              <input type="number" min={12} max={300} value={formData.duration ?? ''} onChange={update('duration')} className={inputClass('duration')} />
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
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Informations complémentaires</label>
              <textarea rows={4} value={formData.notes ?? ''} onChange={update('notes')} className={inputClass('notes')} />
            </div>
          </div>
        </div>
      </StepForm>
    </div>
  );
}
