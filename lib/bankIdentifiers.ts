/** Normalise le RIB tunisien : uniquement les chiffres, attendu 20. */
export function normalizeRib(input: string): string {
  return String(input ?? '').replace(/\D/g, '');
}

/** Normalise l’IBAN : sans espaces, en majuscules. */
export function normalizeIban(input: string): string {
  return String(input ?? '')
    .replace(/\s/g, '')
    .toUpperCase();
}

/** RIB tunisien : 20 chiffres (identifiant de compte). */
export function isValidTunisianRib(rib: string): boolean {
  const d = normalizeRib(rib);
  return d.length === 20;
}

/** IBAN Tunisie : TN + 22 caractères alphanumériques (souvent chiffres). Longueur totale 24. */
export function isValidTunisianIban(iban: string): boolean {
  const s = normalizeIban(iban);
  if (s.length !== 24) return false;
  if (!/^TN[0-9A-Z]{22}$/.test(s)) return false;
  return true;
}

export function formatRibForDisplay(rib: string | null | undefined): string {
  const d = normalizeRib(rib ?? '');
  if (!d) return '—';
  return d.replace(/(.{4})/g, '$1 ').trim();
}

export function formatIbanForDisplay(iban: string | null | undefined): string {
  const s = normalizeIban(iban ?? '');
  if (!s) return '—';
  return s.replace(/(.{4})/g, '$1 ').trim();
}
