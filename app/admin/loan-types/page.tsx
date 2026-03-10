'use client';

import { useCallback, useEffect, useState } from 'react';

type LoanType = {
  id: string;
  name: string;
  description: string | null;
  min_amount: number;
  max_amount: number;
  min_duration_months: number;
  max_duration_months: number;
  interest_rate_percent: number;
  max_debt_ratio_percent: number;
  required_documents: string[];
  active: boolean;
  updated_at: string;
};

const EMPTY: Omit<LoanType, 'id' | 'active' | 'updated_at'> = {
  name: '',
  description: '',
  min_amount: 1000,
  max_amount: 200000,
  min_duration_months: 6,
  max_duration_months: 120,
  interest_rate_percent: 4.5,
  max_debt_ratio_percent: 40,
  required_documents: ['CIN (recto/verso)', 'Bulletins de salaire (3 derniers mois)', 'Relevés bancaires (6 derniers mois)'],
};

function formatTND(n: number) {
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' TND';
}

function DocsEditor({ docs, onChange }: { docs: string[]; onChange: (d: string[]) => void }) {
  const [newDoc, setNewDoc] = useState('');
  return (
    <div>
      <ul className="space-y-1 mb-2">
        {docs.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="flex-1 text-sm text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">{d}</span>
            <button
              type="button"
              onClick={() => onChange(docs.filter((_, j) => j !== i))}
              className="text-red-400 hover:text-red-600 text-lg leading-none"
              title="Supprimer"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input
          type="text"
          value={newDoc}
          onChange={(e) => setNewDoc(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && newDoc.trim()) {
              e.preventDefault();
              onChange([...docs, newDoc.trim()]);
              setNewDoc('');
            }
          }}
          placeholder="Nouvelle pièce… (Entrée pour ajouter)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => { if (newDoc.trim()) { onChange([...docs, newDoc.trim()]); setNewDoc(''); } }}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
        >
          +
        </button>
      </div>
    </div>
  );
}

function NumField({ label, value, onChange, step, min, max, unit }: {
  label: string; value: number; onChange: (v: number) => void;
  step?: number; min?: number; max?: number; unit?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          step={step ?? 1}
          min={min ?? 0}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
        />
        {unit && <span className="text-sm text-gray-500 shrink-0">{unit}</span>}
      </div>
    </div>
  );
}

export default function AdminLoanTypes() {
  const [loanTypes, setLoanTypes] = useState<LoanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | 'new' | null>(null);
  const [form, setForm] = useState<Omit<LoanType, 'id' | 'active' | 'updated_at'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetch = useCallback(() => {
    setLoading(true);
    window.fetch('/api/admin/loan-types', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { loanTypes: [] }))
      .then((d) => setLoanTypes(Array.isArray(d.loanTypes) ? d.loanTypes : []))
      .catch(() => setLoanTypes([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openEdit = (lt: LoanType) => {
    setForm({
      name: lt.name, description: lt.description ?? '',
      min_amount: lt.min_amount, max_amount: lt.max_amount,
      min_duration_months: lt.min_duration_months, max_duration_months: lt.max_duration_months,
      interest_rate_percent: lt.interest_rate_percent, max_debt_ratio_percent: lt.max_debt_ratio_percent,
      required_documents: [...lt.required_documents],
    });
    setEditId(lt.id);
  };

  const openNew = () => { setForm({ ...EMPTY, required_documents: [...EMPTY.required_documents] }); setEditId('new'); };
  const closeEdit = () => setEditId(null);

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Le nom est requis', false); return; }
    setSaving(true);
    try {
      const isNew = editId === 'new';
      const url = isNew ? '/api/admin/loan-types' : `/api/admin/loan-types/${editId}`;
      const method = isNew ? 'POST' : 'PATCH';
      const res = await window.fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      if (res.ok) {
        const updated = await res.json();
        if (isNew) setLoanTypes((prev) => [...prev, updated]);
        else setLoanTypes((prev) => prev.map((lt) => (lt.id === editId ? updated : lt)));
        closeEdit();
        showToast(isNew ? 'Type de crédit créé' : 'Modifications enregistrées');
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.error || 'Erreur', false);
      }
    } finally { setSaving(false); }
  };

  const toggleActive = async (lt: LoanType) => {
    const res = await window.fetch(`/api/admin/loan-types/${lt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !lt.active }),
      credentials: 'include',
    });
    if (res.ok) {
      const updated = await res.json();
      setLoanTypes((prev) => prev.map((x) => (x.id === lt.id ? updated : x)));
      showToast(updated.active ? 'Type activé' : 'Type désactivé');
    }
  };

  const handleDelete = async (lt: LoanType) => {
    if (!confirm(`Supprimer "${lt.name}" ?`)) return;
    setDeleting(lt.id);
    const res = await window.fetch(`/api/admin/loan-types/${lt.id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) { setLoanTypes((prev) => prev.filter((x) => x.id !== lt.id)); showToast('Supprimé'); }
    else showToast('Erreur lors de la suppression', false);
    setDeleting(null);
  };

  const setField = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="p-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-lg font-medium text-white transition-all ${toast.ok ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Types de crédit</h1>
          <p className="text-gray-600 mt-1">Paramétrez les conditions et les pièces requises pour chaque type de crédit</p>
        </div>
        <button
          onClick={openNew}
          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow"
        >
          + Nouveau type
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : loanTypes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Aucun type de crédit. Créez-en un ou exécutez la migration.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {loanTypes.map((lt) => (
            <div key={lt.id} className={`bg-white rounded-2xl border-2 shadow transition-all ${lt.active ? 'border-gray-200 hover:border-blue-300' : 'border-dashed border-gray-300 opacity-70'}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{lt.name}</h3>
                    {lt.description && <p className="text-sm text-gray-500 mt-0.5">{lt.description}</p>}
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold ${lt.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {lt.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Montant</p>
                    <p className="text-sm font-semibold text-gray-900">{formatTND(lt.min_amount)} – {formatTND(lt.max_amount)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Durée</p>
                    <p className="text-sm font-semibold text-gray-900">{lt.min_duration_months} – {lt.max_duration_months} mois</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                    <p className="text-xs text-blue-700 uppercase tracking-wide mb-0.5">Taux</p>
                    <p className="text-sm font-bold text-blue-700">{lt.interest_rate_percent} %</p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                    <p className="text-xs text-orange-700 uppercase tracking-wide mb-0.5">Endettem. max</p>
                    <p className="text-sm font-bold text-orange-700">{lt.max_debt_ratio_percent} %</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">Pièces requises</p>
                  <ul className="space-y-1">
                    {lt.required_documents.map((d, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-sm text-gray-700">
                        <span className="text-blue-400">•</span>{d}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(lt)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => toggleActive(lt)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${lt.active ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                  >
                    {lt.active ? 'Désactiver' : 'Activer'}
                  </button>
                  <button
                    onClick={() => handleDelete(lt)}
                    disabled={deleting === lt.id}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50"
                  >
                    {deleting === lt.id ? '…' : 'Suppr.'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create modal */}
      {editId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="px-8 py-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editId === 'new' ? 'Nouveau type de crédit' : 'Modifier le type'}</h2>
              <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Nom *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setField('name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ex : Crédit immobilier"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">Description</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={(e) => setField('description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  placeholder="Description courte…"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <NumField label="Montant min. (TND)" value={form.min_amount} onChange={(v) => setField('min_amount', v)} min={0} />
                <NumField label="Montant max. (TND)" value={form.max_amount} onChange={(v) => setField('max_amount', v)} min={0} />
                <NumField label="Durée min. (mois)" value={form.min_duration_months} onChange={(v) => setField('min_duration_months', v)} min={1} />
                <NumField label="Durée max. (mois)" value={form.max_duration_months} onChange={(v) => setField('max_duration_months', v)} min={1} />
                <NumField label="Taux d'intérêt (%)" value={form.interest_rate_percent} onChange={(v) => setField('interest_rate_percent', v)} step={0.1} min={0} max={100} />
                <NumField label="Endettement max. (%)" value={form.max_debt_ratio_percent} onChange={(v) => setField('max_debt_ratio_percent', v)} step={0.5} min={0} max={100} />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">Pièces requises</label>
                <DocsEditor docs={form.required_documents} onChange={(d) => setField('required_documents', d)} />
              </div>
            </div>

            <div className="px-8 py-5 border-t border-gray-200 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {saving ? 'Enregistrement…' : editId === 'new' ? 'Créer' : 'Enregistrer'}
              </button>
              <button onClick={closeEdit} className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50">
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
