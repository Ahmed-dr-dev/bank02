'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepForm from '@/components/StepForm';
import FileUpload from '@/components/FileUpload';
import { validateStep, CIN_MAX_LENGTH, type RequestFormData } from '@/lib/creditRequestValidation';
import { GUARANTEE_TYPE_OPTIONS, guaranteeSelectOptionLabel } from '@/lib/guaranteeTypes';

const emptyForm: RequestFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  cin: '',
  phone: '',
  email: '',
  employmentStatus: '',
  profession: '',
  employer: '',
  workAddress: '',
  monthlyIncome: '',
  additionalIncome: '',
  rentMortgage: '',
  otherCharges: '',
  existingLoans: '',
  loanPayment: '',
  creditAmount: '',
  duration: '',
  creditPurpose: '',
  guaranteeType: '',
  notes: '',
};

export default function NewRequest() {
  const router = useRouter();
  const [formData, setFormData] = useState<RequestFormData>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const steps = ['État civil', 'Professionnel', 'Revenus et charges', 'Détails du crédit', 'Documents'];

  const update = (key: keyof RequestFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  const validateCurrentStep = (stepIndex: number): boolean => {
    const stepErrors = validateStep(formData, stepIndex);
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [documentFiles, setDocumentFiles] = useState<Record<string, File[]>>({});

  const onDocumentFiles = (key: string) => (files: File[]) => {
    setDocumentFiles((prev) => ({ ...prev, [key]: files }));
  };

  const handleSubmit = async () => {
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
      const res = await fetch('/api/credit-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || res.statusText);
      }
      const created = await res.json();
      const requestId = created?.id;
      const allFiles = Object.values(documentFiles).flat();
      if (requestId && allFiles.length > 0) {
        const form = new FormData();
        allFiles.forEach((f) => form.append('files', f));
        await fetch(`/api/credit-requests/${requestId}/documents`, {
          method: 'POST',
          body: form,
          credentials: 'include',
        });
      }
      router.push(requestId ? `/client/request/${requestId}` : '/client/requests');
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Erreur lors de l\'envoi');
    } finally {
      setSubmitting(false);
    }
  };

  const err = (key: string) => errors[key];
  const inputClass = (key: string) =>
    `w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${err(key) ? 'border-red-500' : 'border-gray-300'}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nouvelle demande de crédit</h1>
        <p className="text-gray-600 mt-1">Remplissez toutes les étapes pour soumettre votre dossier (exigences Tunisie, TND)</p>
      </div>

      {submitError && (
        <p className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{submitError}</p>
      )}
      <StepForm steps={steps} onSubmit={handleSubmit} locale="fr" onValidateStep={validateCurrentStep} submitDisabled={submitting}>
        {/* Étape 1 : État civil */}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
              <input type="date" value={formData.dateOfBirth ?? ''} onChange={update('dateOfBirth')} className={inputClass('dateOfBirth')} />
              {err('dateOfBirth') && <p className="text-red-500 text-sm mt-1">{err('dateOfBirth')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CIN (carte d&apos;identité nationale)</label>
              <input type="text" value={formData.cin ?? ''} onChange={update('cin')} className={inputClass('cin')} maxLength={CIN_MAX_LENGTH} />
              {err('cin') && <p className="text-red-500 text-sm mt-1">{err('cin')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone (Tunisie)</label>
              <input type="tel" value={formData.phone ?? ''} onChange={update('phone')} className={inputClass('phone')} />
              {err('phone') && <p className="text-red-500 text-sm mt-1">{err('phone')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input type="email" value={formData.email ?? ''} onChange={update('email')} className={inputClass('email')} />
              {err('email') && <p className="text-red-500 text-sm mt-1">{err('email')}</p>}
            </div>
          </div>
        </div>

        {/* Étape 2 : Professionnel */}
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
              <input type="text" value={formData.profession ?? ''} onChange={update('profession')} className={inputClass('profession')} />
              {err('profession') && <p className="text-red-500 text-sm mt-1">{err('profession')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employeur</label>
              <input type="text" value={formData.employer ?? ''} onChange={update('employer')} className={inputClass('employer')} />
              {err('employer') && <p className="text-red-500 text-sm mt-1">{err('employer')}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse professionnelle</label>
              <input type="text" value={formData.workAddress ?? ''} onChange={update('workAddress')} className={inputClass('workAddress')} />
            </div>
          </div>
        </div>

        {/* Étape 3 : Revenus et charges */}
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
              {err('rentMortgage') && <p className="text-red-500 text-sm mt-1">{err('rentMortgage')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Autres charges mensuelles (TND)</label>
              <input type="number" min={0} value={formData.otherCharges ?? ''} onChange={update('otherCharges')} className={inputClass('otherCharges')} />
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
              <input type="number" min={0} value={formData.loanPayment ?? ''} onChange={update('loanPayment')} className={inputClass('loanPayment')} />
              {err('loanPayment') && <p className="text-red-500 text-sm mt-1">{err('loanPayment')}</p>}
            </div>
          </div>
        </div>

        {/* Étape 4 : Détails du crédit */}
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
              {err('creditPurpose') && <p className="text-red-500 text-sm mt-1">{err('creditPurpose')}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de garantie</label>
              <select value={formData.guaranteeType ?? ''} onChange={update('guaranteeType')} className={inputClass('guaranteeType')}>
                <option value="">Choisir</option>
                {GUARANTEE_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {guaranteeSelectOptionLabel(opt)}
                  </option>
                ))}
              </select>
              {err('guaranteeType') && <p className="text-red-500 text-sm mt-1">{err('guaranteeType')}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Informations complémentaires</label>
              <textarea rows={4} value={formData.notes ?? ''} onChange={update('notes')} className={inputClass('notes')} />
            </div>
          </div>
        </div>

        {/* Étape 5 : Documents */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Téléverser les pièces</h2>
          <FileUpload label="CIN (recto et verso)" accept="image/*" hideUploadHints onFilesChange={onDocumentFiles('cin')} />
          <FileUpload label="Bulletins de salaire (3 derniers mois)" accept=".pdf,.doc,.docx" multiple hideUploadHints onFilesChange={onDocumentFiles('paySlips')} />
          <FileUpload label="Relevés bancaires (6 derniers mois)" accept=".pdf" multiple hideUploadHints onFilesChange={onDocumentFiles('bankStatements')} />
          <FileUpload label="Justificatif de domicile" accept=".pdf,image/*" hideUploadHints onFilesChange={onDocumentFiles('domicile')} />
          <FileUpload label="Autres pièces (optionnel)" accept="*" multiple hideUploadHints onFilesChange={onDocumentFiles('other')} />
        </div>
      </StepForm>
    </div>
  );
}
