/**
 * Validation règles adaptées au marché tunisien (TND, CIN, téléphone +216, BCT)
 */

export const CIN_MAX_LENGTH = 12;
const MIN_AGE = 21; // âge minimum pour un crédit (pratique courante en Tunisie)
const MIN_CREDIT_AMOUNT_TND = 1_000;
const MAX_CREDIT_AMOUNT_TND = 2_000_000;
const MIN_DURATION_MONTHS = 12;
const MAX_DURATION_MONTHS = 300; // 25 ans max
const MAX_DEBT_RATIO_PERCENT = 40; // plafond taux d'endettement (recommandations BCT / bonnes pratiques)
const MIN_MONTHLY_INCOME_TND = 500;
const CIN_MIN_LENGTH = 6;
const PHONE_TUNISIA_REGEX = /^(?:\+216|216)?[0-9]{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RequestFormData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  cin?: string;
  phone?: string;
  email?: string;
  employmentStatus?: string;
  profession?: string;
  employer?: string;
  yearsExperience?: string;
  workAddress?: string;
  monthlyIncome?: string;
  additionalIncome?: string;
  rentMortgage?: string;
  otherCharges?: string;
  existingLoans?: string;
  loanPayment?: string;
  creditAmount?: string;
  duration?: string;
  creditPurpose?: string;
  guaranteeType?: string;
  notes?: string;
}

export function validateStep1EtatCivil(data: RequestFormData): Record<string, string> {
  const err: Record<string, string> = {};
  if (!data.firstName?.trim()) err.firstName = 'Prénom requis';
  if (!data.lastName?.trim()) err.lastName = 'Nom requis';
  if (!data.dateOfBirth?.trim()) err.dateOfBirth = 'Date de naissance requise';
  else {
    const birth = new Date(data.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    if (age < MIN_AGE) err.dateOfBirth = `Âge minimum requis : ${MIN_AGE} ans (réservé aux résidents en Tunisie)`;
  }
  const cinDigits = data.cin?.replace(/\s/g, '') ?? '';
  if (!cinDigits) err.cin = 'CIN requise';
  else if (cinDigits.length < CIN_MIN_LENGTH || cinDigits.length > CIN_MAX_LENGTH)
    err.cin = `La CIN doit contenir entre ${CIN_MIN_LENGTH} et ${CIN_MAX_LENGTH} caractères`;
  const phoneDigits = data.phone?.replace(/\D/g, '') ?? '';
  if (!data.phone?.trim()) err.phone = 'Téléphone requis';
  else if (!PHONE_TUNISIA_REGEX.test(phoneDigits))
    err.phone = 'Numéro tunisien invalide (ex. +216 XX XXX XXX ou 8 chiffres)';
  if (!data.email?.trim()) err.email = 'E-mail requis';
  else if (!EMAIL_REGEX.test(data.email)) err.email = 'E-mail invalide';
  return err;
}

export function validateStep2Pro(data: RequestFormData): Record<string, string> {
  const err: Record<string, string> = {};
  if (!data.employmentStatus?.trim()) err.employmentStatus = 'Situation professionnelle requise';
  if (!data.profession?.trim()) err.profession = 'Profession requise';
  if (!data.employer?.trim()) err.employer = 'Employeur requis';
  const years = parseInt(data.yearsExperience ?? '', 10);
  if (data.yearsExperience !== undefined && data.yearsExperience !== '' && (isNaN(years) || years < 0 || years > 50))
    err.yearsExperience = 'Nombre d\'années invalide (0-50)';
  return err;
}

export function validateStep3Revenus(data: RequestFormData): Record<string, string> {
  const err: Record<string, string> = {};
  const income = parseFloat(data.monthlyIncome ?? '');
  if (data.monthlyIncome === undefined || data.monthlyIncome === '')
    err.monthlyIncome = 'Revenu net mensuel requis';
  else if (isNaN(income) || income < MIN_MONTHLY_INCOME_TND)
    err.monthlyIncome = `Revenu minimum : ${MIN_MONTHLY_INCOME_TND} TND`;
  const addIncome = parseFloat(data.additionalIncome ?? '0') || 0;
  const rent = parseFloat(data.rentMortgage ?? '0') || 0;
  const other = parseFloat(data.otherCharges ?? '0') || 0;
  const loanPmt = parseFloat(data.loanPayment ?? '0') || 0;
  if (isNaN(parseFloat(data.rentMortgage ?? '')) && data.rentMortgage !== '' && data.rentMortgage !== undefined)
    err.rentMortgage = 'Montant invalide';
  if (isNaN(parseFloat(data.otherCharges ?? '')) && data.otherCharges !== '' && data.otherCharges !== undefined)
    err.otherCharges = 'Montant invalide';
  if (isNaN(parseFloat(data.loanPayment ?? '')) && data.loanPayment !== '' && data.loanPayment !== undefined)
    err.loanPayment = 'Montant invalide';
  return err;
}

export function validateStep4Credit(data: RequestFormData): Record<string, string> {
  const err: Record<string, string> = {};
  const amount = parseFloat(data.creditAmount ?? '');
  if (data.creditAmount === undefined || data.creditAmount === '')
    err.creditAmount = 'Montant demandé requis';
  else if (isNaN(amount) || amount < MIN_CREDIT_AMOUNT_TND)
    err.creditAmount = `Montant minimum : ${MIN_CREDIT_AMOUNT_TND.toLocaleString('fr-FR')} TND`;
  else if (amount > MAX_CREDIT_AMOUNT_TND)
    err.creditAmount = `Montant maximum : ${MAX_CREDIT_AMOUNT_TND.toLocaleString('fr-FR')} TND`;
  const duration = parseInt(data.duration ?? '', 10);
  if (data.duration === undefined || data.duration === '')
    err.duration = 'Durée requise';
  else if (isNaN(duration) || duration < MIN_DURATION_MONTHS)
    err.duration = `Durée minimum : ${MIN_DURATION_MONTHS} mois`;
  else if (duration > MAX_DURATION_MONTHS)
    err.duration = `Durée maximum : ${MAX_DURATION_MONTHS} mois (25 ans)`;
  if (!data.creditPurpose?.trim()) err.creditPurpose = 'Objet du crédit requis';
  if (!data.guaranteeType?.trim()) err.guaranteeType = 'Type de garantie requis';
  // Taux d'endettement (optionnel mais recommandé)
  const monthlyIncome = parseFloat(data.monthlyIncome ?? '0') || 0;
  const additionalIncome = parseFloat(data.additionalIncome ?? '0') || 0;
  const totalIncome = monthlyIncome + additionalIncome;
  const rent = parseFloat(data.rentMortgage ?? '0') || 0;
  const other = parseFloat(data.otherCharges ?? '0') || 0;
  const loanPmt = parseFloat(data.loanPayment ?? '0') || 0;
  if (totalIncome > 0 && amount > 0 && duration > 0) {
    const rate = 0.045 / 12;
    const monthlyCredit = (amount * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1);
    const debtRatio = ((monthlyCredit + rent + other + loanPmt) / totalIncome) * 100;
    if (debtRatio > MAX_DEBT_RATIO_PERCENT)
      err.creditAmount = `Taux d'endettement trop élevé (${debtRatio.toFixed(0)} %). Maximum conseillé : ${MAX_DEBT_RATIO_PERCENT} % (règles BCT).`;
  }
  return err;
}

export function validateStep(data: RequestFormData, step: number): Record<string, string> {
  switch (step) {
    case 0: return validateStep1EtatCivil(data);
    case 1: return validateStep2Pro(data);
    case 2: return validateStep3Revenus(data);
    case 3: return validateStep4Credit(data);
    default: return {};
  }
}
