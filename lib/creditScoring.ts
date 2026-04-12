/**
 * Scoring crédit — modèle simple sur 100 points :
 * 1) Taux d’endettement (charges + mensualité estimée du nouveau crédit) ÷ revenus mensuels totaux → max 60 pts
 * 2) Valeur estimative de la garantie ÷ montant demandé → max 40 pts
 * La profession n’entre pas dans le calcul.
 */

export type CreditScoringInput = {
  monthlyIncome: number;
  additionalIncome: number;
  rentMortgage: number;
  otherCharges: number;
  loanPayment: number;
  creditAmount: number;
  durationMonths: number;
  guaranteeEstimatedValue: number;
};

export type ScoreComponent = {
  id: string;
  title: string;
  points: number;
  maxPoints: number;
  detailFr: string;
};

export type CreditScoringResult = {
  totalScore: number;
  category: 'low' | 'medium' | 'high';
  components: ScoreComponent[];
  estimatedNewMonthlyPayment: number;
  totalMonthlyResources: number;
  fixedMonthlyCharges: number;
  debtRatioAfterNewLoanPercent: number | null;
  guaranteeToLoanPercent: number | null;
};

/** Taux annuel nominal indicatif pour estimer la mensualité du nouveau crédit (non contractuel). */
export const SCORING_ANNUAL_RATE_INDICATIVE = 0.08;

const MAX_DEBT_POINTS = 60;
const MAX_GUARANTEE_POINTS = 40;

function clamp(n: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, n));
}

/** Mensualité constante (amortissement à taux fixe). */
export function estimateMonthlyPayment(principal: number, durationMonths: number, annualRate: number): number {
  if (principal <= 0 || durationMonths <= 0) return 0;
  const r = annualRate / 12;
  if (r <= 0) return principal / durationMonths;
  const pow = Math.pow(1 + r, durationMonths);
  return (principal * r * pow) / (pow - 1);
}

/** Points selon le taux d’endettement (ratio 0–1+). Max 60. Plus le taux est bas, plus la note est élevée. */
function scoreFromDebtRatio(ratio: number): number {
  if (ratio <= 0.25) return MAX_DEBT_POINTS;
  if (ratio <= 0.33) return 50;
  if (ratio <= 0.4) return 40;
  if (ratio <= 0.5) return 25;
  if (ratio <= 0.6) return 12;
  return 0;
}

/** Points selon garantie ÷ montant. Max 40. Sans garantie déclarée → 0. */
function scoreFromGuaranteeRatio(ratio: number, hasGuarantee: boolean): number {
  if (!hasGuarantee) return 0;
  if (ratio >= 1.2) return MAX_GUARANTEE_POINTS;
  if (ratio >= 0.9) return 32;
  if (ratio >= 0.6) return 22;
  if (ratio >= 0.35) return 12;
  return 5;
}

export function creditScoringInputFromDbRow(row: {
  monthly_income: number | null;
  additional_income: number | null;
  rent_mortgage: number | null;
  other_charges: number | null;
  loan_payment: number | null;
  amount: number | unknown;
  duration: number | unknown;
  guarantee_estimated_value?: number | null;
}): CreditScoringInput {
  const gRaw = row.guarantee_estimated_value;
  const guaranteeEstimatedValue =
    gRaw != null && Number.isFinite(Number(gRaw)) && Number(gRaw) > 0 ? Number(gRaw) : 0;

  return {
    monthlyIncome: Number(row.monthly_income) || 0,
    additionalIncome: Number(row.additional_income) || 0,
    rentMortgage: Number(row.rent_mortgage) || 0,
    otherCharges: Number(row.other_charges) || 0,
    loanPayment: Number(row.loan_payment) || 0,
    creditAmount: Number(row.amount) || 0,
    durationMonths: Math.round(Number(row.duration) || 0),
    guaranteeEstimatedValue,
  };
}

export function computeCreditScoring(input: CreditScoringInput): CreditScoringResult {
  const monthlyIncome = Math.max(0, Number(input.monthlyIncome) || 0);
  const additionalIncome = Math.max(0, Number(input.additionalIncome) || 0);
  const rentMortgage = Math.max(0, Number(input.rentMortgage) || 0);
  const otherCharges = Math.max(0, Number(input.otherCharges) || 0);
  const loanPayment = Math.max(0, Number(input.loanPayment) || 0);
  const creditAmount = Math.max(0, Number(input.creditAmount) || 0);
  const durationMonths = Math.max(0, Math.round(Number(input.durationMonths) || 0));
  const guaranteeEstimatedValue = Math.max(0, Number(input.guaranteeEstimatedValue) || 0);

  const totalMonthlyResources = monthlyIncome + additionalIncome;
  const fixedMonthlyCharges = rentMortgage + otherCharges + loanPayment;
  const estimatedNewMonthlyPayment = estimateMonthlyPayment(creditAmount, durationMonths, SCORING_ANNUAL_RATE_INDICATIVE);

  const res = Math.max(totalMonthlyResources, 1);
  const chargesTotales = fixedMonthlyCharges + estimatedNewMonthlyPayment;
  const debtRatio = chargesTotales / res;
  const debtRatioPercent = Math.round(debtRatio * 1000) / 10;

  const debtPts = scoreFromDebtRatio(debtRatio);
  const principal = Math.max(creditAmount, 0);
  const hasGuarantee = principal > 0 && guaranteeEstimatedValue > 0;
  const guaranteeRatio = principal > 0 ? guaranteeEstimatedValue / principal : 0;
  const guaranteeRatioPercent = hasGuarantee ? Math.round(guaranteeRatio * 1000) / 10 : null;
  const guaranteePts = scoreFromGuaranteeRatio(guaranteeRatio, hasGuarantee);

  let total = clamp(Math.round(debtPts + guaranteePts), 0, 100);
  const category: CreditScoringResult['category'] = total >= 70 ? 'high' : total >= 50 ? 'medium' : 'low';

  const debtDetail = `Taux d’endettement : (charges fixes ${Math.round(fixedMonthlyCharges).toLocaleString('fr-FR')} TND + mensualité estimée du nouveau crédit ${Math.round(estimatedNewMonthlyPayment).toLocaleString('fr-FR')} TND) ÷ revenus mensuels totaux ${Math.round(res).toLocaleString('fr-FR')} TND = ${debtRatioPercent} %. Plus ce taux est bas, plus la note de ce volet est élevée (max. ${MAX_DEBT_POINTS} pts). Référence courante : rester sous 40 %.`;

  const guaranteeDetail = hasGuarantee
    ? `Valeur estimative de la garantie ${Math.round(guaranteeEstimatedValue).toLocaleString('fr-FR')} TND ÷ montant demandé ${Math.round(principal).toLocaleString('fr-FR')} TND ≈ ${guaranteeRatioPercent} %. Plus le ratio est élevé, plus la note de ce volet augmente (max. ${MAX_GUARANTEE_POINTS} pts).`
    : `Aucune valeur de garantie estimative déclarée (ou montant nul) : 0 pt sur ${MAX_GUARANTEE_POINTS} possibles pour ce volet.`;

  const components: ScoreComponent[] = [
    {
      id: 'taux_endettement',
      title: 'Taux d’endettement',
      points: debtPts,
      maxPoints: MAX_DEBT_POINTS,
      detailFr: debtDetail,
    },
    {
      id: 'garantie_estimee',
      title: 'Garantie estimée / montant demandé',
      points: guaranteePts,
      maxPoints: MAX_GUARANTEE_POINTS,
      detailFr: guaranteeDetail,
    },
  ];

  return {
    totalScore: total,
    category,
    components,
    estimatedNewMonthlyPayment,
    totalMonthlyResources,
    fixedMonthlyCharges,
    debtRatioAfterNewLoanPercent: debtRatioPercent,
    guaranteeToLoanPercent: guaranteeRatioPercent,
  };
}

export const SCORING_DOCUMENTATION_FR = {
  titre: 'Comment est calculé votre score ?',
  introduction:
    'Le score sur 100 repose sur deux éléments seulement : votre taux d’endettement après prise en compte du nouveau crédit, et la couverture par la valeur estimative de votre garantie par rapport au montant demandé. Aucune autre règle (profession, secteur, etc.) n’est appliquée.',
  blocs: [
    {
      sousTitre: `1. Taux d’endettement (jusqu’à ${MAX_DEBT_POINTS} points)`,
      textes: [
        'On additionne vos charges fixes mensuelles (loyer ou crédit logement, autres charges, mensualités des crédits en cours) et une mensualité estimée du nouveau crédit (taux annuel indicatif 8 % et durée déclarée — non contractuel).',
        'On divise ce total par vos revenus mensuels totaux (revenu net principal + autres revenus déclarés).',
        'Plus le pourcentage obtenu est faible, plus vous marquez de points. En pratique, un taux nettement sous 40 % est souvent visé.',
      ],
    },
    {
      sousTitre: `2. Garantie estimée / montant du crédit (jusqu’à ${MAX_GUARANTEE_POINTS} points)`,
      textes: [
        'On utilise la valeur estimative de la garantie que vous avez indiquée (TND), divisée par le montant du crédit demandé.',
        'Plus ce rapport est élevé, plus ce volet augmente le score. Si vous ne renseignez pas de valeur, ce volet vaut 0 point.',
      ],
    },
    {
      sousTitre: 'Barème du score total',
      textes: [
        '70 à 100 : catégorie « élevé ».',
        '50 à 69 : catégorie « moyen ».',
        '0 à 49 : catégorie « faible ».',
      ],
    },
    {
      sousTitre: 'Limites',
      textes: [
        'Ce score est indicatif ; il ne remplace pas l’instruction complète du dossier.',
        'La mensualité du nouveau crédit est une estimation ; le taux réel peut différer.',
      ],
    },
  ],
} as const;

export function scoreAndCategoryForDb(row: Parameters<typeof creditScoringInputFromDbRow>[0]): { score: number; score_category: 'low' | 'medium' | 'high' } {
  const r = computeCreditScoring(creditScoringInputFromDbRow(row));
  return { score: r.totalScore, score_category: r.category };
}
