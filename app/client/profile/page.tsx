'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';

/** Champs éditables + métadonnées renvoyées par GET /api/profile (hors password_hash). */
type ProfileData = {
  id?: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  cin: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  profession: string | null;
  employer: string | null;
  years_experience: number | null;
  monthly_income: number | null;
  rib: string | null;
  iban: string | null;
  role?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const EMPTY_PROFILE: ProfileData = {
  full_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  cin: '',
  address: '',
  city: '',
  postal_code: '',
  country: '',
  profession: '',
  employer: '',
  years_experience: null,
  monthly_income: null,
  rib: '',
  iban: '',
};

function toDateInputValue(v: unknown): string {
  if (v == null || v === '') return '';
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Mappe la réponse Supabase/JSON vers l’état formulaire (tous les champs utiles). */
function normalizeProfileFromApi(raw: Record<string, unknown>): ProfileData {
  return {
    id: typeof raw.id === 'string' ? raw.id : undefined,
    full_name: raw.full_name != null ? String(raw.full_name) : '',
    email: raw.email != null ? String(raw.email) : '',
    phone: raw.phone != null ? String(raw.phone) : '',
    date_of_birth: toDateInputValue(raw.date_of_birth),
    cin: raw.cin != null ? String(raw.cin) : '',
    address: raw.address != null ? String(raw.address) : '',
    city: raw.city != null ? String(raw.city) : '',
    postal_code: raw.postal_code != null ? String(raw.postal_code) : '',
    country: raw.country != null ? String(raw.country) : '',
    profession: raw.profession != null ? String(raw.profession) : '',
    employer: raw.employer != null ? String(raw.employer) : '',
    years_experience: toNumberOrNull(raw.years_experience),
    monthly_income: toNumberOrNull(raw.monthly_income),
    rib: raw.rib != null ? String(raw.rib) : '',
    iban: raw.iban != null ? String(raw.iban) : '',
    role: raw.role != null ? String(raw.role) : null,
    created_at: raw.created_at != null ? String(raw.created_at) : null,
    updated_at: raw.updated_at != null ? String(raw.updated_at) : null,
  };
}

function splitName(fullName: string | null): { firstName: string; lastName: string } {
  const value = (fullName ?? '').trim();
  if (!value) return { firstName: '', lastName: '' };
  const parts = value.split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

const ROLE_LABELS: Record<string, string> = {
  client: 'Client',
  admin: 'Administrateur',
  credit_officer: 'Chargé de crédit',
};

export default function ClientProfile() {
  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError('');
        const res = await fetch('/api/profile', { credentials: 'include' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Impossible de charger le profil.');
        }
        const raw = (await res.json()) as Record<string, unknown>;
        setProfile(normalizeProfileFromApi(raw));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Impossible de charger le profil.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const { firstName, lastName } = useMemo(() => splitName(profile.full_name), [profile.full_name]);
  const initials = useMemo(() => {
    const a = firstName?.[0] ?? '';
    const b = lastName?.[0] ?? '';
    const fallback = (profile.email ?? '')[0] ?? 'U';
    return `${a}${b}`.trim().toUpperCase() || fallback.toUpperCase();
  }, [firstName, lastName, profile.email]);

  const numericKeys = new Set<keyof ProfileData>(['monthly_income', 'years_experience']);

  const updateField =
    (key: keyof ProfileData) => (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setProfile((prev) => ({
        ...prev,
        [key]: numericKeys.has(key) ? (value === '' ? null : Number(value)) : value,
      }));
      if (success) setSuccess('');
    };

  const updateFirstName = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setProfile((prev) => ({
      ...prev,
      full_name: [value, splitName(prev.full_name).lastName].filter(Boolean).join(' ').trim(),
    }));
    if (success) setSuccess('');
  };

  const updateLastName = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setProfile((prev) => ({
      ...prev,
      full_name: [splitName(prev.full_name).firstName, value].filter(Boolean).join(' ').trim(),
    }));
    if (success) setSuccess('');
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const payload: Record<string, unknown> = {
        full_name: profile.full_name?.trim() || null,
        email: profile.email?.trim() || null,
        phone: profile.phone?.trim() || null,
        date_of_birth: profile.date_of_birth || null,
        cin: profile.cin?.trim() || null,
        address: profile.address?.trim() || null,
        city: profile.city?.trim() || null,
        postal_code: profile.postal_code?.trim() || null,
        country: profile.country?.trim() || null,
        profession: profile.profession?.trim() || null,
        employer: profile.employer?.trim() || null,
        years_experience: profile.years_experience,
        monthly_income: profile.monthly_income,
      };
      const ribT = profile.rib?.trim();
      const ibanT = profile.iban?.trim();
      if (ribT) payload.rib = ribT;
      if (ibanT) payload.iban = ibanT;

      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Impossible de sauvegarder le profil.');
      }

      const raw = (await res.json()) as Record<string, unknown>;
      setProfile(normalizeProfileFromApi(raw));
      setSuccess('Profil mis à jour avec succès.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Impossible de sauvegarder le profil.');
    } finally {
      setSaving(false);
    }
  };

  const formatMetaDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('fr-FR', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  if (loading) {
    return <div className="p-8 max-w-4xl mx-auto text-gray-600">Chargement du profil...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon profil</h1>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {success && <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{success}</p>}

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
              {initials}
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-gray-900">{profile.full_name || 'Client'}</h2>
              <p className="text-gray-600">{profile.email || 'Aucun e-mail'}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Compte vérifié</span>
            </div>
          </div>
        </div>

        {(profile.id || profile.role || profile.created_at || profile.updated_at) && (
          <div className="p-6 border-b border-gray-200 bg-gray-50/80">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compte</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              {profile.id && (
                <div>
                  <p className="text-gray-500 mb-0.5">Identifiant</p>
                  <p className="font-mono text-gray-800 text-xs break-all">{profile.id}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 mb-0.5">Rôle</p>
                <p className="font-medium text-gray-900">
                  {ROLE_LABELS[profile.role ?? ''] ?? profile.role ?? '—'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Inscription</p>
                <p className="font-medium text-gray-900">{formatMetaDate(profile.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-0.5">Dernière mise à jour (profil)</p>
                <p className="font-medium text-gray-900">{formatMetaDate(profile.updated_at)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Coordonnées bancaires</h3>
          <p className="text-sm text-gray-600 mb-4">RIB (20 chiffres) et IBAN tunisien (24 caractères, ex. TN59…).</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">RIB</label>
              <input
                type="text"
                inputMode="numeric"
                value={profile.rib ?? ''}
                onChange={updateField('rib')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="20 chiffres"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
              <input
                type="text"
                value={profile.iban ?? ''}
                onChange={(e) => {
                  setProfile((prev) => ({ ...prev, iban: e.target.value.toUpperCase() }));
                  if (success) setSuccess('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="TN…"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
              <input type="text" value={firstName} onChange={updateFirstName} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input type="text" value={lastName} onChange={updateLastName} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
              <input type="email" value={profile.email ?? ''} onChange={updateField('email')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
              <input type="tel" value={profile.phone ?? ''} onChange={updateField('phone')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
              <input type="date" value={profile.date_of_birth ?? ''} onChange={updateField('date_of_birth')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
              <input type="text" value={profile.cin ?? ''} onChange={updateField('cin')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Situation professionnelle</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
              <input type="text" value={profile.profession ?? ''} onChange={updateField('profession')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Employeur</label>
              <input type="text" value={profile.employer ?? ''} onChange={updateField('employer')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Années d&apos;expérience</label>
              <input
                type="number"
                min={0}
                max={60}
                value={profile.years_experience ?? ''}
                onChange={updateField('years_experience')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Revenu mensuel (TND)</label>
              <input type="number" value={profile.monthly_income ?? ''} onChange={updateField('monthly_income')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
          </div>
        </div>

        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <input type="text" value={profile.address ?? ''} onChange={updateField('address')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                <input type="text" value={profile.city ?? ''} onChange={updateField('city')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                <input type="text" value={profile.postal_code ?? ''} onChange={updateField('postal_code')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                <input type="text" value={profile.country ?? ''} onChange={updateField('country')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 flex justify-end bg-gray-50">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg disabled:opacity-60"
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
