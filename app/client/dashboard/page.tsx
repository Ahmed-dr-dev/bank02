'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { CreditRequest } from '@/lib/mockData';
import { formatIbanForDisplay, formatRibForDisplay } from '@/lib/bankIdentifiers';

type ClientStats = {
  totalRequests: number;
  approvedRequests: number;
  activeRequests: number;
};

type ProfileHeader = {
  full_name: string | null;
  rib: string | null;
  iban: string | null;
};

export default function ClientDashboard() {
  const [requests, setRequests] = useState<CreditRequest[]>([]);
  const [stats, setStats] = useState<ClientStats | null>(null);
  const [profile, setProfile] = useState<ProfileHeader | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqRes, statsRes, profRes] = await Promise.all([
          fetch('/api/credit-requests'),
          fetch('/api/dashboard/stats'),
          fetch('/api/profile', { credentials: 'include' }),
        ]);
        if (reqRes.ok) {
          const data = await reqRes.json();
          setRequests(Array.isArray(data) ? data : []);
        }
        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }
        if (profRes.ok) {
          const p = await profRes.json();
          setProfile({
            full_name: typeof p.full_name === 'string' ? p.full_name : null,
            rib: typeof p.rib === 'string' ? p.rib : null,
            iban: typeof p.iban === 'string' ? p.iban : null,
          });
        } else {
          setProfile(null);
        }
      } catch {
        setRequests([]);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const recent = requests.slice(0, 4);

  const displayName = (profile?.full_name ?? '').trim() || 'Client';

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-slate-50 to-blue-50/80 px-6 py-5 mb-6 shadow-sm">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Espace client</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{displayName}</h1>
          <dl className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-gray-500">RIB</dt>
              <dd className="font-mono font-medium text-gray-900 tracking-wide">{formatRibForDisplay(profile?.rib ?? '')}</dd>
            </div>
            <div>
              <dt className="text-gray-500">IBAN</dt>
              <dd className="font-mono font-medium text-gray-900 tracking-wide break-all">{formatIbanForDisplay(profile?.iban ?? '')}</dd>
            </div>
          </dl>
          {!loading && profile && !profile.rib && !profile.iban && (
            <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Complétez votre RIB et IBAN dans{' '}
              <Link href="/client/profile" className="underline font-medium">
                Mon profil
              </Link>
              .
            </p>
          )}
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Accueil</h2>
        <p className="text-gray-600 mt-1">Demande de crédit, simulation et suivi de vos dossiers</p>
        {stats != null && (
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalRequests} demande{stats.totalRequests !== 1 ? 's' : ''} · {stats.approvedRequests} approuvée{stats.approvedRequests !== 1 ? 's' : ''} · {stats.activeRequests} en cours
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/client/new-request"
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:border-blue-300 hover:shadow-xl transition-all group"
        >
          <span className="text-4xl block mb-4">📝</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">Demande de crédit</h2>
          <p className="text-gray-600 text-sm">Déposer une nouvelle demande de crédit en TND</p>
          <span className="inline-block mt-4 text-blue-600 font-medium text-sm">Créer une demande →</span>
        </Link>

        <Link
          href="/client/simulator"
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:border-green-300 hover:shadow-xl transition-all group"
        >
          <span className="text-4xl block mb-4">💰</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600">Simulateur</h2>
          <p className="text-gray-600 text-sm">Estimer vos mensualités et montant possible en TND</p>
          <span className="inline-block mt-4 text-green-600 font-medium text-sm">Ouvrir le simulateur →</span>
        </Link>

        <Link
          href="/client/requests"
          className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:border-purple-300 hover:shadow-xl transition-all group"
        >
          <span className="text-4xl block mb-4">📄</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600">Suivi des dossiers</h2>
          <p className="text-gray-600 text-sm">Voir le statut de vos demandes en cours et passées</p>
          <span className="inline-block mt-4 text-purple-600 font-medium text-sm">Voir mes dossiers →</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Dernières demandes</h2>
          <Link href="/client/requests" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Voir tout →
          </Link>
        </div>
        <div className="p-6">
          {loading ? (
            <p className="text-gray-500 text-center py-6">Chargement…</p>
          ) : recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map((r) => (
                <Link
                  key={r.id}
                  href={`/client/request/${r.id}`}
                  className="flex justify-between items-center p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-900">{Number(r.amount).toLocaleString()} TND</span>
                  <span className="text-sm text-gray-600">{r.duration} mois</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      r.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : r.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : r.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-orange-100 text-orange-800'
                    }`}
                  >
                    {r.status === 'approved' ? 'Approuvé' : r.status === 'pending' ? 'En attente' : r.status === 'rejected' ? 'Refusé' : 'Garanties'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">Aucune demande. <Link href="/client/new-request" className="text-blue-600 hover:underline">Créer une demande</Link></p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-gray-600">
        <Link href="/client/loan-types" className="hover:text-blue-600">Types de crédit</Link>
        <Link href="/client/profile" className="hover:text-blue-600">Mon profil</Link>
        <a href="mailto:contact@creditpro.tn" className="hover:text-blue-600">Nous contacter</a>
      </div>
    </div>
  );
}
