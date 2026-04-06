/**
 * Scoring crédit — règles explicites, reproductibles.
 * Ne prend pas en compte la profession : uniquement revenus, charges, capacité d’endettement et charge du nouveau prêt.
 */

export type CreditScoringInput = {
  monthlyIncome: number;
  additionalIncome: number;
  rentMortgage: number;
  otherCharges: number;
  loanPayment: number;
  creditAmount: number;
  durationMonths: number;
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
  /** Mensualité théorique du nouveau crédit (hypothèse documentée) */
  estimatedNewMonthlyPayment: number;
  /** Revenus mensuels totaux (net + autres) */
  totalMonthlyResources: number;
  /** Charges fixes avant nouveau crédit */
  fixedMonthlyCharges: number;
  /** Taux d’endettement après ajout de la mensualité estimée */
  debtRatioAfterNewLoanPercent: number | null;
};

/** Taux annuel nominal indicatif pour estimer une mensualité (à titre pédagogique, pas une offre). */
export const SCORING_ANNUAL_RATE_INDICATIVE = 0.08;

const MIN_INCOME_FLOOR = 500;
const MAX_INCOME_REF = 25_000;

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

function scoreRevenuPrincipal(monthlyIncome: number): { pts: number; detailFr: string } {
  const x = Number(monthlyIncome) || 0;
  if (x < MIN_INCOME_FLOOR) {
    return {
      pts: 0,
      detailFr: `Revenu net mensuel déclaré (${Math.round(x)} TND) est inférieur au plancher retenu pour l’analyse (${MIN_INCOME_FLOOR} TND).`,
    };
  }
  const t = clamp((x - MIN_INCOME_FLOOR) / (MAX_INCOME_REF - MIN_INCOME_FLOOR), 0, 1);
  const pts = Math.round(30 * Math.pow(t, 0.85));
  return {
    pts,
    detailFr: `Revenu net mensuel principal : ${Math.round(x).toLocaleString('fr-FR')} TND. Plus le revenu principal est élevé (dans des limites raisonnables), plus la note de ce volet augmente (max. 30 pts). Référence haute : ${MAX_INCOME_REF.toLocaleString('fr-FR')} TND.`,
  };
}

function scoreCapaciteEndettement(
  totalResources: number,
  fixedCharges: number,
  newPayment: number
): { pts: number; detailFr: string; ratioPercent: number | null } {
  const res = Math.max(totalResources, 1);
  const chargesTotales = fixedCharges + newPayment;
  const ratio = chargesTotales / res;
  const ratioPercent = Math.round(ratio * 1000) / 10;

  let pts: number;
  if (ratio <= 0.25) pts = 40;
  else if (ratio <= 0.33) pts = 34;
  else if (ratio <= 0.4) pts = 28;
  else if (ratio <= 0.5) pts = 18;
  else if (ratio <= 0.6) pts = 8;
  else pts = 0;

  return {
    pts,
    detailFr: `Capacité d’endettement : charges fixes (loyer/prêt logement, autres charges, mensualités crédits en cours) + mensualité estimée du nouveau crédit, rapportées aux revenus mensuels totaux (net + autres revenus). Taux obtenu : ${ratioPercent} %. Bonnes pratiques : rester nettement sous 40 % (référence fréquemment utilisée). Plus le taux est bas, plus la note est élevée (max. 40 pts).`,
    ratioPercent,
  };
}

function scoreRevenusComplementaires(additionalIncome: number, monthlyIncome: number): { pts: number; detailFr: string } {
  const add = Math.max(0, Number(additionalIncome) || 0);
  const main = Math.max(0, Number(monthlyIncome) || 0);
  if (add <= 0) {
    return {
      pts: 10,
      detailFr: `Aucun autre revenu mensuel déclaré : attribution d’une partie modérée des points (10 / 20), sans pénalité forte — le volet « revenu principal » et « capacité d’endettement » portent l’essentiel du jugement.`,
    };
  }
  const share = main > 0 ? add / main : 1;
  const base = 12 + Math.min(8, Math.round(share * 16));
  const pts = clamp(base, 12, 20);
  return {
    pts,
    detailFr: `Autres revenus mensuels : ${Math.round(add).toLocaleString('fr-FR')} TND. Ils augmentent vos ressources totales et peuvent améliorer la note jusqu’à 20 pts selon leur poids par rapport au revenu principal.`,
  };
}

function scoreChargeDuPret(creditAmount: number, totalMonthlyResources: number, durationMonths: number): { pts: number; detailFr: string } {
  const annualResources = Math.max(totalMonthlyResources, 1) * 12;
  const amount = Math.max(0, Number(creditAmount) || 0);
  const multiple = amount / annualResources;
  let pts: number;
  if (multiple <= 1.5) pts = 10;
  else if (multiple <= 2.5) pts = 7;
  else if (multiple <= 4) pts = 4;
  else pts = 1;

  return {
    pts,
    detailFr: `Rapport entre le montant demandé (${Math.round(amount).toLocaleString('fr-FR')} TND) et vos revenus annuels estimés (${Math.round(annualResources).toLocaleString('fr-FR')} TND, sur la base des revenus mensuels déclarés × 12). Multiple : ${multiple.toFixed(2)}. Durée déclarée : ${durationMonths} mois. Un multiple élevé augmente le risque relatif ; ce volet apporte au plus 10 pts.`,
  };
}

export function creditScoringInputFromDbRow(row: {
  monthly_income: number | null;
  additional_income: number | null;
  rent_mortgage: number | null;
  other_charges: number | null;
  loan_payment: number | null;
  amount: number | unknown;
  duration: number | unknown;
}): CreditScoringInput {
  return {
    monthlyIncome: Number(row.monthly_income) || 0,
    additionalIncome: Number(row.additional_income) || 0,
    rentMortgage: Number(row.rent_mortgage) || 0,
    otherCharges: Number(row.other_charges) || 0,
    loanPayment: Number(row.loan_payment) || 0,
    creditAmount: Number(row.amount) || 0,
    durationMonths: Math.round(Number(row.duration) || 0),
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

  const totalMonthlyResources = monthlyIncome + additionalIncome;
  const fixedMonthlyCharges = rentMortgage + otherCharges + loanPayment;
  const estimatedNewMonthlyPayment = estimateMonthlyPayment(creditAmount, durationMonths, SCORING_ANNUAL_RATE_INDICATIVE);

  const r1 = scoreRevenuPrincipal(monthlyIncome);
  const r2 = scoreCapaciteEndettement(totalMonthlyResources, fixedMonthlyCharges, estimatedNewMonthlyPayment);
  const r3 = scoreRevenusComplementaires(additionalIncome, monthlyIncome);
  const r4 = scoreChargeDuPret(creditAmount, totalMonthlyResources, durationMonths);

  let total = r1.pts + r2.pts + r3.pts + r4.pts;
  total = clamp(Math.round(total), 0, 100);

  const category: CreditScoringResult['category'] = total >= 70 ? 'high' : total >= 50 ? 'medium' : 'low';

  const components: ScoreComponent[] = [
    {
      id: 'revenu_principal',
      title: 'Revenu net mensuel principal',
      points: r1.pts,
      maxPoints: 30,
      detailFr: r1.detailFr,
    },
    {
      id: 'capacite_endettement',
      title: 'Capacité d’endettement (charges / revenus)',
      points: r2.pts,
      maxPoints: 40,
      detailFr: r2.detailFr,
    },
    {
      id: 'revenus_complementaires',
      title: 'Autres revenus mensuels',
      points: r3.pts,
      maxPoints: 20,
      detailFr: r3.detailFr,
    },
    {
      id: 'charge_pret',
      title: 'Montant de la demande / revenus annuels',
      points: r4.pts,
      maxPoints: 10,
      detailFr: r4.detailFr,
    },
  ];

  return {
    totalScore: total,
    category,
    components,
    estimatedNewMonthlyPayment,
    totalMonthlyResources,
    fixedMonthlyCharges,
    debtRatioAfterNewLoanPercent: r2.ratioPercent,
  };
}

/** Texte pédagogique complet pour l’interface (français). */
export const SCORING_DOCUMENTATION_FR = {
  titre: 'Comment est calculé votre score ?',
  introduction:
    'Le score est un indicateur interne sur 100 points. Il est entièrement calculé à partir de données chiffrées de votre dossier : aucune pondération liée à la profession, au secteur ou à l’intitulé d’emploi n’est utilisée.',
  blocs: [
    {
      sousTitre: '1. Revenu net mensuel principal (jusqu’à 30 points)',
      textes: [
        'Il s’agit du revenu net mensuel que vous avez déclaré dans le formulaire (hors « autres revenus »).',
        'Un revenu très bas par rapport à un plancher minimal réduit fortement ce volet ; au-delà, la note augmente progressivement jusqu’à un plafond de référence.',
      ],
    },
    {
      sousTitre: '2. Capacité d’endettement (jusqu’à 40 points)',
      textes: [
        'On calcule d’abord vos revenus mensuels totaux : revenu net principal + autres revenus mensuels déclarés.',
        'On additionne vos charges récurrentes : loyer ou mensualité de prêt immobilier, autres charges mensuelles, mensualités de crédits en cours.',
        'On ajoute une mensualité estimée pour le nouveau crédit demandé, calculée avec une hypothèse de taux annuel nominal indicatif (8 %) et la durée déclarée — à titre pédagogique, sans valeur contractuelle.',
        'Le taux d’endettement retenu est : (charges fixes + mensualité estimée du nouveau crédit) ÷ revenus mensuels totaux. Plus ce ratio est faible, plus la note est élevée. La zone au-dessus de 40 % est généralement considérée comme sensible.',
      ],
    },
    {
      sousTitre: '3. Autres revenus mensuels (jusqu’à 20 points)',
      textes: [
        'Les revenus complémentaires déclarés renforcent votre profil lorsqu’ils existent.',
        'S’il n’y en a pas, une partie modérée des points est tout de même attribuée : l’absence d’autres revenus ne pénalise pas seule ce critère.',
      ],
    },
    {
      sousTitre: '4. Montant demandé par rapport aux revenus annuels (jusqu’à 10 points)',
      textes: [
        'On compare le montant du crédit demandé à une estimation de vos revenus sur une année (revenus mensuels totaux × 12).',
        'Un multiple très élevé (emprunt important par rapport aux revenus) réduit ce volet ; un multiple modéré le conserve élevé.',
      ],
    },
    {
      sousTitre: 'Barème qualitatif du score total',
      textes: [
        '70 à 100 : profil favorable (catégorie « élevé »).',
        '50 à 69 : profil intermédiaire (catégorie « moyen ») — instruction pouvant nécessiter garanties ou compléments.',
        '0 à 49 : profil plus fragile (catégorie « faible ») — risque ou charges élevées au regard des revenus déclarés.',
      ],
    },
    {
      sousTitre: 'Limites et transparence',
      textes: [
        'Ce score ne remplace pas une analyse manuelle complète (pièces justificatives, historique bancaire, politique interne de la banque).',
        'La mensualité estimée du nouveau crédit est une approximation à partir d’un taux indicatif ; le taux réel peut différer.',
        'Les données utilisées sont celles saisies dans votre demande ; toute erreur de saisie impacte le résultat.',
      ],
    },
  ],
} as const;

export function scoreAndCategoryForDb(row: Parameters<typeof creditScoringInputFromDbRow>[0]): { score: number; score_category: 'low' | 'medium' | 'high' } {
  const r = computeCreditScoring(creditScoringInputFromDbRow(row));
  return { score: r.totalScore, score_category: r.category };
}
