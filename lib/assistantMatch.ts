import { STATIC_REPLIES } from '@/lib/chatBotStaticReplies';

export type AssistantReplyRow = {
  id?: string;
  keywords: string[];
  reply: string;
};

const FALLBACK =
  "Je n'ai pas trouvé de réponse précise à votre question. Vous pouvez : consulter les pages « Comment ça marche » et « Fonctionnalités » sur le site, utiliser le simulateur, ou contacter le support : contact@creditpro.tn / +216 70 000 000.";

function includesKeyword(query: string, keyword: string): boolean {
  const k = keyword.toLowerCase().trim();
  return k.length > 0 && query.includes(k);
}

/** Custom DB rows first (in given order), then built-in static replies. */
export function getAssistantReplyForQuery(query: string, customReplies: AssistantReplyRow[]): string {
  const q = query.toLowerCase().trim();
  if (!q) return 'Pouvez-vous préciser votre question ?';

  for (const { keywords, reply } of customReplies) {
    if (keywords.some((k) => includesKeyword(q, k))) return reply;
  }
  for (const { keywords, reply } of STATIC_REPLIES) {
    if (keywords.some((k) => includesKeyword(q, k))) return reply;
  }
  return FALLBACK;
}
