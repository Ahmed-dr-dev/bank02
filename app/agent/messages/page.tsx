'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Conversation = {
  requestId: string;
  trackingCode: string | null;
  clientName: string;
  clientEmail: string;
  requestStatus: string;
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
  guarantees_required: 'Garanties req.',
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

export default function AgentMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchConversations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/agent/messages', { credentials: 'include' });
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

  const filtered = conversations.filter((c) => {
    if (filter === 'unread') return c.unreadCount > 0;
    return true;
  });

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  return (
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messagerie</h1>
          <p className="text-gray-600 mt-1">Conversations avec les clients</p>
        </div>
        {totalUnread > 0 && (
          <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-semibold text-sm">
            {totalUnread} message{totalUnread > 1 ? 's' : ''} non lu{totalUnread > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            {f === 'all' ? 'Toutes' : `Non lus (${totalUnread})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <p className="text-5xl mb-4">💬</p>
          <p className="text-gray-500 font-medium">
            {filter === 'unread' ? 'Aucun message non lu.' : 'Aucune conversation.'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Les conversations s'affichent ici dès qu'un client écrit.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((conv) => (
            <Link
              key={conv.requestId}
              href={`/agent/requests/${conv.requestId}#messages`}
              className="block bg-white rounded-2xl border border-gray-200 hover:border-emerald-400 hover:shadow-md transition-all p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="shrink-0 w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-700 text-lg">
                    {(conv.clientName?.[0] ?? 'C').toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 truncate">{conv.clientName}</p>
                      {conv.unreadCount > 0 && (
                        <span className="shrink-0 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusClass[conv.requestStatus] || 'bg-gray-100'}`}>
                        {statusLabel[conv.requestStatus] ?? conv.requestStatus}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{conv.clientEmail}</p>
                    {conv.lastMessage && (
                      <p className={`text-sm mt-1.5 truncate ${conv.unreadCount > 0 && conv.lastMessage.sender_role === 'client' ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                        {conv.lastMessage.sender_role === 'client' ? '' : 'Vous : '}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {conv.lastMessage && (
                    <p className="text-xs text-gray-400">{formatTime(conv.lastMessage.created_at)}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Dossier #{(conv.trackingCode ?? conv.requestId.slice(0, 8)).toUpperCase()}
                  </p>
                  {!conv.lastMessage && (
                    <p className="text-xs text-gray-400 mt-1">{conv.totalMessages} msg</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
