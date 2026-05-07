'use client';

import { useEffect, useState } from 'react';
import ChangePasswordSection from '@/components/ChangePasswordSection';

const ROLE_LABELS: Record<string, string> = {
  client: 'Client',
  admin: 'Administrateur',
  credit_officer: 'Chargé de crédit',
};

const HEADER_BG: Record<'admin' | 'agent', string> = {
  admin: 'bg-gradient-to-r from-blue-50 to-indigo-50',
  agent: 'bg-gradient-to-r from-emerald-50 to-teal-50',
};

export function StaffProfileView({ theme }: { theme: 'admin' | 'agent' }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/profile', { credentials: 'include' });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Erreur');
        if (cancelled) return;
        setFullName(typeof data.full_name === 'string' ? data.full_name : '');
        setEmail(typeof data.email === 'string' ? data.email : '');
        setRole(typeof data.role === 'string' ? data.role : null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div className="p-8 max-w-4xl mx-auto text-gray-600">Chargement du profil…</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Mon profil</h1>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className={`p-8 border-b border-gray-200 ${HEADER_BG[theme]}`}>
          <h2 className="text-xl font-bold text-gray-900">{fullName.trim() || 'Utilisateur'}</h2>
          <p className="text-gray-600 mt-1">{email || '—'}</p>
          {role && (
            <p className="text-sm text-gray-500 mt-2">
              Rôle :{' '}
              <span className="font-medium text-gray-800">{ROLE_LABELS[role] ?? role}</span>
            </p>
          )}
        </div>
        <ChangePasswordSection />
      </div>
    </div>
  );
}
