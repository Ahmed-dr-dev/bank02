'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  sender_id: string;
  sender_role: string;
  sender_name: string | null;
  content: string;
  read_at: string | null;
  created_at: string;
};

const AGENT_QUICK_REPLIES = [
  'Documents manquants : merci de fournir votre CIN (recto/verso).',
  'Documents manquants : bulletins de salaire (3 derniers mois) requis.',
  'Documents manquants : relevés bancaires (6 derniers mois) requis.',
  'Documents manquants : justificatif de domicile requis.',
  'Votre dossier est incomplet. Merci de compléter les pièces manquantes.',
  'Votre dossier est en cours d\'instruction. Nous vous contacterons.',
  'Des garanties supplémentaires sont requises pour votre dossier.',
  'Votre dossier est complet. Vous recevrez une réponse prochainement.',
];

const CLIENT_QUICK_REPLIES = [
  'J\'ai ajouté les documents demandés. Merci de vérifier.',
  'Pourriez-vous m\'indiquer l\'état d\'avancement de mon dossier ?',
  'Je souhaite soumettre une réclamation concernant ma demande.',
  'Je n\'ai pas reçu de réponse depuis plusieurs jours.',
  'Je souhaite modifier des informations dans ma demande.',
  'Quelles pièces manquent-il dans mon dossier ?',
];

interface RequestChatProps {
  requestId: string;
  currentRole: 'client' | 'credit_officer' | 'admin';
}

function formatTime(s: string) {
  const d = new Date(s);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (isToday) return time;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + time;
}

export default function RequestChat({ requestId, currentRole }: RequestChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchMessages = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch(`/api/credit-requests/${requestId}/messages`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        if (data.currentUserId) setCurrentUserId(data.currentUserId);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 8000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText('');
    setShowQuickReplies(false);
    try {
      const res = await fetch(`/api/credit-requests/${requestId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
        credentials: 'include',
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
      }
    } finally {
      setSending(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const quickReplies = currentRole === 'client' ? CLIENT_QUICK_REPLIES : AGENT_QUICK_REPLIES;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Chargement des messages…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: '480px' }}>
      {/* Messages scroll area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 select-none">
            <span className="text-5xl mb-3">💬</span>
            <p className="font-medium text-gray-500">Aucun message</p>
            <p className="text-sm mt-1">
              {currentRole === 'client'
                ? 'Posez vos questions à votre chargé de crédit.'
                : 'Commencez la conversation avec le client.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId;
            const isAgent = msg.sender_role === 'credit_officer' || msg.sender_role === 'admin';
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex flex-col gap-1 max-w-[78%] ${isMe ? 'items-end' : 'items-start'}`}>
                  {/* Avatar + name */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 px-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${isAgent ? 'bg-emerald-600' : 'bg-blue-500'}`}>
                        {isAgent ? 'C' : 'U'}
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {msg.sender_name ?? (isAgent ? 'Chargé de crédit' : 'Client')}
                      </span>
                    </div>
                  )}
                  {/* Bubble */}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-tr-sm' : 'bg-white text-gray-900 border border-gray-200 rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                  {/* Time + read status */}
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                    {isMe && (
                      <span className={`text-xs font-medium ${msg.read_at ? 'text-emerald-500' : 'text-gray-400'}`}>
                        {msg.read_at ? '✓✓ Lu' : '✓ Envoyé'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      {showQuickReplies && (
        <div className="border-t border-gray-200 bg-white px-3 py-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Réponses rapides</span>
            <button onClick={() => setShowQuickReplies(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          </div>
          <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            {quickReplies.map((qr, i) => (
              <button
                key={i}
                onClick={() => send(qr)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-50 hover:border-emerald-400 border border-gray-200 text-gray-700 rounded-full text-xs font-medium transition-all text-left"
              >
                {qr}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="border-t border-gray-200 bg-white px-3 py-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowQuickReplies((v) => !v)}
          title="Réponses rapides"
          className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all ${showQuickReplies ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
        >
          ⚡
        </button>
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send(text);
            }
          }}
          placeholder="Écrire un message… (Entrée pour envoyer)"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
          disabled={sending}
          maxLength={2000}
        />
        <button
          onClick={() => send(text)}
          disabled={!text.trim() || sending}
          className="shrink-0 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-40 font-semibold text-sm transition-all"
        >
          {sending ? '…' : 'Envoyer'}
        </button>
      </div>
    </div>
  );
}
