'use client';

import { useCallback, useEffect, useState } from 'react';

type Row = {
  id: string;
  keywords: string[];
  reply: string;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
};

export default function AdminAssistantReplies() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [keywordsInput, setKeywordsInput] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editKeywords, setEditKeywords] = useState('');
  const [editReply, setEditReply] = useState('');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/assistant-replies', { credentials: 'include' })
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = '/login';
          return;
        }
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || 'Erreur');
        setRows(Array.isArray(d.replies) ? d.replies : []);
      })
      .catch((e) => showToast(e instanceof Error ? e.message : 'Erreur chargement', false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addRow = async () => {
    const kw = keywordsInput.trim();
    const reply = replyInput.trim();
    if (!kw || !reply) {
      showToast('Renseignez les mots-clés et la réponse', false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/assistant-replies', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: kw, reply }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Échec');
      setKeywordsInput('');
      setReplyInput('');
      showToast('Réponse ajoutée');
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur', false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Supprimer cette réponse ?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/assistant-replies/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Échec');
      showToast('Supprimé');
      if (editingId === id) {
        setEditingId(null);
      }
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur', false);
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (r: Row) => {
    setEditingId(r.id);
    setEditKeywords(r.keywords.join(', '));
    setEditReply(r.reply);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const kw = editKeywords.trim();
    const reply = editReply.trim();
    if (!kw || !reply) {
      showToast('Mots-clés et réponse requis', false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/assistant-replies/${editingId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: kw, reply }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Échec');
      setEditingId(null);
      showToast('Enregistré');
      load();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur', false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900">Assistant — réponses</h1>
      <p className="text-gray-600 mt-2 text-sm">
        Les réponses ci-dessous sont testées <strong>avant</strong> les réponses par défaut du site. Mots-clés :
        séparés par des virgules ; la question du visiteur doit <strong>contenir</strong> l’un des mots-clés
        (sans respect de la casse).
      </p>

      {toast && (
        <div
          className={`mt-4 px-4 py-3 rounded-xl text-sm font-medium ${
            toast.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {toast.msg}
        </div>
      )}

      <section className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une réponse</h2>
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Mots-clés</label>
        <input
          type="text"
          value={keywordsInput}
          onChange={(e) => setKeywordsInput(e.target.value)}
          placeholder="ex. frais, commission, tarif"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm mb-4 focus:ring-2 focus:ring-blue-500"
        />
        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Réponse</label>
        <textarea
          value={replyInput}
          onChange={(e) => setReplyInput(e.target.value)}
          rows={4}
          placeholder="Texte affiché lorsque la question contient un des mots-clés…"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={addRow}
          disabled={saving}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Ajouter'}
        </button>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Réponses en base</h2>
        {loading ? (
          <p className="text-gray-500">Chargement…</p>
        ) : rows.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune réponse personnalisée — l’assistant utilise uniquement les réponses par défaut.</p>
        ) : (
          <ul className="space-y-4">
            {rows.map((r) => (
              <li key={r.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                {editingId === r.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editKeywords}
                      onChange={(e) => setEditKeywords(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <textarea
                      value={editReply}
                      onChange={(e) => setEditReply(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEdit}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        Enregistrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Mots-clés</p>
                    <p className="text-sm text-gray-800 mb-3">{r.keywords.join(', ')}</p>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Réponse</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap mb-4">{r.reply}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(r)}
                        className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(r.id)}
                        disabled={deleting === r.id}
                        className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 disabled:opacity-50"
                      >
                        {deleting === r.id ? 'Suppression…' : 'Supprimer'}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
