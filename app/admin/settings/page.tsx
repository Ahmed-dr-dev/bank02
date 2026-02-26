'use client';

import { useCallback, useEffect, useState } from 'react';

type ScoringConfig = {
  minApprovalScore: number;
  maxDebtRatioPercent: number;
  interestRatePercent: number;
  highScoreMin: number;
  mediumScoreMin: number;
};

export default function AdminSettings() {
  const [scoring, setScoring] = useState<ScoringConfig>({
    minApprovalScore: 70,
    maxDebtRatioPercent: 40,
    interestRatePercent: 4.5,
    highScoreMin: 70,
    mediumScoreMin: 50,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<'saved' | 'error' | null>(null);

  const fetchScoring = useCallback(() => {
    fetch('/api/admin/scoring', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setScoring({
          minApprovalScore: data.minApprovalScore ?? 70,
          maxDebtRatioPercent: data.maxDebtRatioPercent ?? 40,
          interestRatePercent: data.interestRatePercent ?? 4.5,
          highScoreMin: data.highScoreMin ?? 70,
          mediumScoreMin: data.mediumScoreMin ?? 50,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchScoring();
  }, [fetchScoring]);

  const handleSave = async () => {
    setMessage(null);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/scoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scoring),
        credentials: 'include',
      });
      if (res.ok) {
        setMessage('saved');
        setTimeout(() => setMessage(null), 3000);
      } else setMessage('error');
    } catch {
      setMessage('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">Configuration du système et du scoring</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Scoring crédit</h2>
          {loading ? (
            <p className="text-gray-500">Chargement…</p>
          ) : (
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Score minimum pour approbation</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={scoring.minApprovalScore}
                  onChange={(e) => setScoring((s) => ({ ...s, minApprovalScore: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taux d&apos;endettement max. (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={scoring.maxDebtRatioPercent}
                  onChange={(e) => setScoring((s) => ({ ...s, maxDebtRatioPercent: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taux d&apos;intérêt (%)</label>
                <input
                  type="number"
                  step={0.1}
                  min={0}
                  value={scoring.interestRatePercent}
                  onChange={(e) => setScoring((s) => ({ ...s, interestRatePercent: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seuil score élevé (≥)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={scoring.highScoreMin}
                  onChange={(e) => setScoring((s) => ({ ...s, highScoreMin: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Seuil score moyen (≥)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={scoring.mediumScoreMin}
                  onChange={(e) => setScoring((s) => ({ ...s, mediumScoreMin: Number(e.target.value) || 0 }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={loading || saving}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg disabled:opacity-50"
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          {message === 'saved' && <span className="text-green-600 font-medium">Enregistré.</span>}
          {message === 'error' && <span className="text-red-600 font-medium">Erreur.</span>}
        </div>
      </div>
    </div>
  );
}
