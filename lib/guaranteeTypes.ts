/**
 * Montants indicatifs en TND pour l’affichage (non contractuels, orientation client).
 */
export type GuaranteeTypeOption = {
  value: string;
  /** Montant estimatif typique / plancher affiché ; null = sans montant associé */
  estimatedAmountTnd: number | null;
};

export const GUARANTEE_TYPE_OPTIONS: GuaranteeTypeOption[] = [
  { value: 'Immobilier', estimatedAmountTnd: 150_000 },
  { value: 'Véhicule', estimatedAmountTnd: 35_000 },
  { value: 'Virement de salaire', estimatedAmountTnd: 12_000 },
  { value: 'Caution personnelle', estimatedAmountTnd: 25_000 },
  { value: 'Aucune', estimatedAmountTnd: null },
];

const byValue = new Map(GUARANTEE_TYPE_OPTIONS.map((o) => [o.value, o]));

export function getGuaranteeTypeOption(value: string | undefined | null): GuaranteeTypeOption | undefined {
  if (!value?.trim()) return undefined;
  return byValue.get(value.trim());
}

export function formatGuaranteeEstimatedTnd(amount: number | null | undefined): string {
  if (amount == null || !Number.isFinite(amount)) return '—';
  return `${Math.round(amount).toLocaleString('fr-FR')} TND`;
}

/** Libellé pour une option de liste déroulante */
export function guaranteeSelectOptionLabel(opt: GuaranteeTypeOption): string {
  if (opt.estimatedAmountTnd == null) {
    return `${opt.value} (sans garantie mobilisable — 0 TND)`;
  }
  return `${opt.value} (estimation indicative : ${formatGuaranteeEstimatedTnd(opt.estimatedAmountTnd)})`;
}

/** Libellé court : uniquement le type (la valeur estimative est dans un champ à part). */
export function guaranteeSelectOptionShortLabel(opt: GuaranteeTypeOption): string {
  return opt.value;
}

/** Valeur par défaut pour le champ « valeur estimative » (TND) selon le type choisi. */
export function defaultGuaranteeEstimatedValueString(typeValue: string): string {
  const opt = getGuaranteeTypeOption(typeValue);
  if (opt?.estimatedAmountTnd == null) return '';
  return String(Math.round(opt.estimatedAmountTnd));
}

/** Texte pour fiche dossier / PDF : libellé du type uniquement (montant affiché à part si besoin). */
export function describeGuaranteeForDisplay(storedType: string | undefined | null): string {
  if (!storedType?.trim()) return '';
  const opt = getGuaranteeTypeOption(storedType);
  return opt ? opt.value : storedType.trim();
}
