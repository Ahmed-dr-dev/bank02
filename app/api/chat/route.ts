import { NextResponse } from 'next/server';

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const PERPLEXITY_URL = 'https://api.perplexity.ai/chat/completions';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: Request) {
  const openRouterKey = process.env.OPENROUTER_API_KEY?.trim();
  const otherKey = (process.env.OPENAI_API_KEY || process.env.CHAT_API_KEY)?.trim();
  const key = openRouterKey || otherKey;
  if (!key) return NextResponse.json({ error: 'Chat API not configured' }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const userMessage = typeof body.message === 'string' ? body.message : '';
  if (!userMessage && messages.length === 0) return NextResponse.json({ error: 'Message required' }, { status: 400 });

  const explicitUrl = process.env.CHAT_API_URL?.trim();
  const explicitModel = process.env.CHAT_MODEL?.trim();
  const useOpenRouter = explicitUrl?.includes('openrouter') || !!openRouterKey;

  const apiUrl = explicitUrl || (useOpenRouter ? OPENROUTER_URL : key.startsWith('pplx-') ? PERPLEXITY_URL : OPENAI_URL);
  const model = explicitModel || (useOpenRouter ? 'google/gemini-2.0-flash-exp:free' : key.startsWith('pplx-') ? 'sonar' : 'gpt-3.5-turbo');

  const systemContent = `Tu es l'assistant virtuel de CreditPro Tunisie, une plateforme de demande de crédit en dinars tunisiens (TND). Tu réponds en français, de manière courtoise et professionnelle. Tu peux expliquer le processus de demande, les types de crédit (conso, immobilier), le suivi de dossier, le simulateur, et orienter vers la création de compte ou le dépôt de dossier. Ne invente pas de chiffres ou d'offres précises ; renvoie vers le site ou le support (contact@creditpro.tn, +216 70 000 000) pour les détails contractuels.`;

  const chatMessages =
    messages.length > 0
      ? [{ role: 'system' as const, content: systemContent }, ...messages]
      : [{ role: 'system' as const, content: systemContent }, { role: 'user' as const, content: userMessage }];

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: chatMessages,
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    const status = res.status === 401 || res.status === 403 ? 502 : res.status;
    const message = res.status === 401 || res.status === 403
      ? 'Clé API invalide ou expirée. Utilisez une clé OpenRouter (gratuite) : https://openrouter.ai/keys puis .env : OPENROUTER_API_KEY=sk-or-... et CHAT_API_URL=https://openrouter.ai/api/v1/chat/completions'
      : 'Chat error';
    return NextResponse.json({ error: message, details: err }, { status });
  }

  const data = await res.json().catch(() => ({}));
  const reply = data?.choices?.[0]?.message?.content ?? data?.choices?.[0]?.text ?? '';
  return NextResponse.json({ reply });
}
