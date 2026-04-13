'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    cin: '',
    date_of_birth: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'Tunisie',
    profession: '',
    employer: '',
    years_experience: '',
    monthly_income: '',
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Prénom requis';
    if (!form.lastName.trim()) e.lastName = 'Nom requis';
    if (!form.email.trim()) e.email = 'E-mail requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail invalide';
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (!form.phone.trim()) e.phone = 'Téléphone requis';
    else if (!/^(216[0-9]{8}|[0-9]{8})$/.test(phoneDigits)) e.phone = 'Numéro tunisien invalide (8 chiffres ou +216 XX XXX XXX)';
    if (!form.password) e.password = 'Mot de passe requis';
    else if (form.password.length < 6) e.password = 'Minimum 6 caractères';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          cin: form.cin || null,
          date_of_birth: form.date_of_birth || null,
          address: form.address || null,
          city: form.city || null,
          postal_code: form.postal_code || null,
          country: form.country || 'Tunisie',
          profession: form.profession || null,
          employer: form.employer || null,
          years_experience: form.years_experience ? Number(form.years_experience) : null,
          monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
        }),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubmitError(data.error || 'Erreur');
        return;
      }
      router.push('/client/dashboard');
      router.refresh();
    } catch {
      setSubmitError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: ev.target.value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full animate-fade-in">
        <div className="text-center mb-10">
          <Link href="/" className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            CreditPro Tunisie
          </Link>
          <p className="text-gray-600 mt-3 text-lg">Créer votre compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form className="space-y-8" onSubmit={handleSubmit}>
            {submitError && <p className="text-red-600 text-sm">{submitError}</p>}

            {/* Informations de connexion */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Informations personnelles</h3>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prénom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={update('firstName')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Sirine"
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={update('lastName')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Nciri"
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                    <input
                      type="date"
                      value={form.date_of_birth}
                      onChange={update('date_of_birth')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                    <input
                      type="text"
                      value={form.cin}
                      onChange={update('cin')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex. 12345678"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Adresse e-mail <span className="text-red-500">*</span></label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={update('email')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="sirine.nciri@exemple.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone (Tunisie) <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={update('phone')}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="+216 XX XXX XXX"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Adresse */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Adresse</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={update('address')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Rue, numéro…"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={update('city')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Tunis"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                    <input
                      type="text"
                      value={form.postal_code}
                      onChange={update('postal_code')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={update('country')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Situation professionnelle */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Situation professionnelle</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                  <input
                    type="text"
                    value={form.profession}
                    onChange={update('profession')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingénieur, médecin…"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employeur</label>
                  <input
                    type="text"
                    value={form.employer}
                    onChange={update('employer')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Années d&apos;expérience</label>
                  <input
                    type="number"
                    min={0}
                    max={60}
                    value={form.years_experience}
                    onChange={update('years_experience')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Revenu mensuel net (TND)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.monthly_income}
                    onChange={update('monthly_income')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2000"
                  />
                </div>
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Sécurité</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={update('password')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Minimum 6 caractères"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={update('confirmPassword')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Confirmez votre mot de passe"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg disabled:opacity-50"
            >
              {loading ? 'Création…' : 'Créer mon compte'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{' '}
              <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
