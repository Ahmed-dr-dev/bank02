'use client';

import { useCallback, useEffect, useState } from 'react';

type User = { id: string; email: string; full_name: string | null; role: string; created_at: string };

function roleLabel(r: string) {
  if (r === 'admin') return 'Admin';
  if (r === 'credit_officer') return 'Chargé de crédit';
  return 'Client';
}

function roleBadgeClass(r: string) {
  if (r === 'admin') return 'bg-indigo-100 text-indigo-800';
  if (r === 'credit_officer') return 'bg-emerald-100 text-emerald-800';
  return 'bg-gray-100 text-gray-800';
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [showCreateOfficer, setShowCreateOfficer] = useState(false);
  const [createEmail, setCreateEmail] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createName, setCreateName] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/users', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((data) => setUsers(Array.isArray(data.users) ? data.users : []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const setRole = async (userId: string, role: string) => {
    setUpdating(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
        credentials: 'include',
      });
      if (res.ok) setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)));
      else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || 'Erreur');
      }
    } finally {
      setUpdating(null);
    }
  };

  const createOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim() || !createPassword) {
      alert('E-mail et mot de passe requis.');
      return;
    }
    if (createPassword.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    setCreateSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: createEmail.trim().toLowerCase(),
          password: createPassword,
          full_name: createName.trim() || null,
          role: 'credit_officer',
        }),
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setUsers((prev) => [data, ...prev]);
        setShowCreateOfficer(false);
        setCreateEmail('');
        setCreatePassword('');
        setCreateName('');
      } else {
        alert(data.error || 'Erreur lors de la création');
      }
    } finally {
      setCreateSubmitting(false);
    }
  };

  const formatDate = (s: string) => new Date(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Comptes utilisateurs</h1>
          <p className="text-gray-600 mt-1">Gérer les rôles et les accès</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateOfficer(!showCreateOfficer)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium"
        >
          {showCreateOfficer ? 'Annuler' : '+ Créer un chargé de crédit'}
        </button>
      </div>

      {showCreateOfficer && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Nouveau chargé de crédit</h2>
          <form onSubmit={createOfficer} className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
              <input
                type="email"
                value={createEmail}
                onChange={(e) => setCreateEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe * (min. 6)</label>
              <input
                type="password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-end">
              <button type="submit" disabled={createSubmitting} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 font-medium">
                Créer
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Chargement…</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrit le</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{u.full_name ?? '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${roleBadgeClass(u.role)}`}>
                        {roleLabel(u.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <select
                        value={u.role}
                        disabled={updating === u.id}
                        onChange={(e) => setRole(u.id, e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="client">Client</option>
                        <option value="credit_officer">Chargé de crédit</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && users.length === 0 && <p className="text-center text-gray-500 py-8">Aucun utilisateur.</p>}
      </div>
    </div>
  );
}
