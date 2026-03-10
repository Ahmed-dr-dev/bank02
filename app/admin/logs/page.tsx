'use client';

import { useCallback, useEffect, useState } from 'react';

type LogEntry = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  user_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
};

const ACTION_LABELS: Record<string, string> = {
  login: 'Connexion',
  logout: 'Déconnexion',
  request_created: 'Demande créée',
  request_updated: 'Demande mise à jour',
  request_deleted: 'Demande supprimée',
  user_role_updated: 'Rôle modifié',
  scoring_config_updated: 'Scoring modifié',
  message_sent: 'Message envoyé',
  loan_type_created: 'Type de crédit créé',
  loan_type_updated: 'Type de crédit mis à jour',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  credit_officer: 'Chargé de crédit',
  client: 'Client',
};

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-100 text-green-700',
  logout: 'bg-gray-100 text-gray-600',
  request_created: 'bg-blue-100 text-blue-700',
  request_updated: 'bg-yellow-100 text-yellow-700',
  request_deleted: 'bg-red-100 text-red-700',
  user_role_updated: 'bg-purple-100 text-purple-700',
  scoring_config_updated: 'bg-orange-100 text-orange-700',
  message_sent: 'bg-indigo-100 text-indigo-700',
};

export default function AdminLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [userInput, setUserInput] = useState('');

  const limit = 50;

  const fetchLogs = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (actionFilter) params.set('action', actionFilter);
    if (userSearch) params.set('user', userSearch);
    fetch(`/api/admin/logs?${params}`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { logs: [], total: 0 }))
      .then((data) => {
        setLogs(Array.isArray(data.logs) ? data.logs : []);
        setTotal(data.total ?? 0);
      })
      .catch(() => { setLogs([]); setTotal(0); })
      .finally(() => setLoading(false));
  }, [page, actionFilter, userSearch]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const totalPages = Math.ceil(total / limit) || 1;

  const applyUserSearch = () => {
    setUserSearch(userInput.trim());
    setPage(1);
  };

  const clearUserSearch = () => {
    setUserSearch('');
    setUserInput('');
    setPage(1);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Journal d&apos;activité</h1>
        <p className="text-gray-600 mt-1">Historique des actions sur la plateforme</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Recherche par compte</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') applyUserSearch(); }}
                placeholder="Email ou nom d'utilisateur…"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={applyUserSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                Chercher
              </button>
              {userSearch && (
                <button onClick={clearUserSearch} className="px-3 py-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg text-sm">
                  ×
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Action</label>
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les actions</option>
              {Object.entries(ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {userSearch && (
          <p className="mt-3 text-sm text-blue-700 font-medium">
            Filtré par compte : <span className="font-bold">{userSearch}</span> — {total} entrée{total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-500">Chargement…</p>
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-500 py-12">Aucune entrée trouvée.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entité</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 tabular-nums">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-700'}`}>
                          {ACTION_LABELS[log.action] ?? log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {log.user_email ? (
                          <div>
                            <p className="text-sm font-medium text-gray-900">{log.user_email}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {log.user_name && <span className="text-xs text-gray-500">{log.user_name}</span>}
                              {log.user_role && (
                                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                  log.user_role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                                  log.user_role === 'credit_officer' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {ROLE_LABELS[log.user_role] ?? log.user_role}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {log.entity_type && log.entity_id
                          ? <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{log.entity_type} {log.entity_id.slice(0, 8)}…</span>
                          : '—'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                        {Object.keys(log.details ?? {}).length ? (
                          <details>
                            <summary className="cursor-pointer text-blue-600 text-xs hover:underline truncate max-w-[180px]">
                              Voir détails
                            </summary>
                            <pre className="mt-1 text-xs text-gray-700 bg-gray-50 rounded p-2 overflow-x-auto max-w-xs whitespace-pre-wrap">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        ) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {page} / {totalPages} ({total} entrée{total !== 1 ? 's' : ''})
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
