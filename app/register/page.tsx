'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { isValidTunisianIban, isValidTunisianRib, normalizeIban, normalizeRib } from '@/lib/bankIdentifiers';

export default function RegisterPage() {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    rib: '',
    iban: '',
    password: '',
    confirmPassword: '',
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
    const ribNorm = normalizeRib(form.rib);
    if (!ribNorm) e.rib = 'RIB requis (20 chiffres)';
    else if (!isValidTunisianRib(ribNorm)) e.rib = 'RIB invalide : exactement 20 chiffres';
    const ibanNorm = normalizeIban(form.iban);
    if (!ibanNorm) e.iban = 'IBAN requis';
    else if (!isValidTunisianIban(ibanNorm)) e.iban = 'IBAN invalide (Tunisie : TN + 22 caractères, 24 au total)';
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
          rib: normalizeRib(form.rib),
          iban: normalizeIban(form.iban),
          password: form.password,
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
          <form className="space-y-6" onSubmit={handleSubmit}>
            {submitError && <p className="text-red-600 text-sm">{submitError}</p>}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse e-mail</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Numéro de téléphone (Tunisie)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={update('phone')}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="+216 XX XXX XXX"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RIB (20 chiffres)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={form.rib}
                  onChange={update('rib')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${errors.rib ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Ex. 07 12345 012345678901 12"
                />
                {errors.rib && <p className="text-red-500 text-sm mt-1">{errors.rib}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                <input
                  type="text"
                  autoComplete="off"
                  value={form.iban}
                  onChange={(ev) => {
                    setForm((f) => ({ ...f, iban: ev.target.value.toUpperCase() }));
                    if (errors.iban) setErrors((er) => ({ ...er, iban: '' }));
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${errors.iban ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="TN59 … (24 caractères)"
                />
                {errors.iban && <p className="text-red-500 text-sm mt-1">{errors.iban}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe</label>
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
