'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TrackMyLoan() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmed = code.trim();
    if (!trimmed) {
      setError('Entrez votre numéro de dossier');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/public/track?code=${encodeURIComponent(trimmed)}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || 'Dossier introuvable');
        return;
      }
      if (data.id) {
        router.push(`/request/status/${data.id}`);
        return;
      }
      setError('Dossier introuvable');
    } catch {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="track" className="py-12 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Suivi de mon crédit</h2>
          <p className="text-gray-600 text-sm mb-6">
            Entrez le numéro de dossier indiqué sur votre récapitulatif pour voir le statut de votre demande, sans ouvrir de session.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex. A1B2C3D4"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono uppercase"
              maxLength={12}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Recherche…' : 'Voir le statut'}
            </button>
          </form>
          {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
        </div>
      </div>
    </section>
  );
}
