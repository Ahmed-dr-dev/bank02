'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Conversation = {
  requestId: string;
  trackingCode: string | null;
  requestStatus: string;
  amount: number;
  lastMessage: {
    content: string;
    sender_role: string;
    created_at: string;
    read_at: string | null;
  } | null;
  unreadCount: number;
  totalMessages: number;
};

const statusLabel: Record<string, string> = {
  approved: 'Approuvé',
  pending: 'En attente',
  rejected: 'Refusé',
  guarantees_required: 'Garanties requises',
};
const statusClass: Record<string, string> = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  rejected: 'bg-red-100 text-red-800',
  guarantees_required: 'bg-orange-100 text-orange-800',
};

function formatTime(s: string) {
  const d = new Date(s);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
function formatTND(n: number) {
  return Number(n).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' TND';
}

export default function ClientMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/client/messages', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data.conversations) ? data.conversations : []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messagerie</h1>
          <p className="text-gray-600 mt-1">Vos échanges avec votre chargé de crédit</p>
        </div>
        {totalUnread > 0 && (
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl font-semibold text-sm">
            {totalUnread} nouveau{totalUnread > 1 ? 'x' : ''} message{totalUnread > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-5xl mb-4">💬</p>
          <p className="text-gray-600 font-medium text-lg">Aucun message pour l'instant</p>
          <p className="text-sm text-gray-400 mt-2 mb-6">
            Ouvrez un dossier pour démarrer une conversation avec votre chargé de crédit.
          </p>
          <Link href="/client/requests" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
            Voir mes dossiers →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <Link
              key={conv.requestId}
              href={`/client/request/${conv.requestId}#messages`}
              className="block bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="shrink-0 w-11 h-11 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
                    💬
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-gray-900">
                        Dossier {(conv.trackingCode ?? conv.requestId.slice(0, 8)).toUpperCase()}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                          {conv.unreadCount} nouveau{conv.unreadCount > 1 ? 'x' : ''}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass[conv.requestStatus] || 'bg-gray-100'}`}>
                        {statusLabel[conv.requestStatus] ?? conv.requestStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5">{formatTND(conv.amount)}</p>
                    {conv.lastMessage ? (
                      <p className={`text-sm truncate ${conv.unreadCount > 0 && conv.lastMessage.sender_role !== 'client' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage.sender_role === 'client' ? 'Vous : ' : 'Chargé de crédit : '}
                        {conv.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">Démarrer la conversation…</p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400">{formatTime(conv.lastMessage.created_at)}</p>
                  )}
                  <p className="text-xs text-blue-600 font-medium mt-2">Ouvrir →</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
