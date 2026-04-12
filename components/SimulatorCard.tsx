'use client';

import { useMemo, useState } from 'react';
import ScoreBadge from '@/components/ScoreBadge';
import { computeCreditScoring, SCORING_ANNUAL_RATE_INDICATIVE } from '@/lib/creditScoring';
import { GUARANTEE_TYPE_OPTIONS, guaranteeSelectOptionShortLabel } from '@/lib/guaranteeTypes';

interface SimulatorCardProps {
  locale?: 'fr' | 'en';
  currency?: string;
}

const ANNUAL_RATE = 0.045; // 4.5% annuel (Tunisie, indicatif)
const MAX_DEBT_RATIO_GOOD = 33;
const MAX_DEBT_RATIO_ACCEPTABLE = 40;
const MAX_DEBT_RATIO_RISKY = 50;

export default function SimulatorCard({ locale = 'en', currency = 'MAD' }: SimulatorCardProps) {
  const isFr = locale === 'fr';
  const [amount, setAmount] = useState(200000);
  const [duration, setDuration] = useState(120);
  const [income, setIncome] = useState(10000);
  const [additionalIncome, setAdditionalIncome] = useState(0);
  const [rentMortgage, setRentMortgage] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [existingLoanPayment, setExistingLoanPayment] = useState(0);
  const [employmentStatus, setEmploymentStatus] = useState<string>('Salarié(e)');
  const [creditPurpose, setCreditPurpose] = useState<string>('Achat immobilier');
  const [guaranteeType, setGuaranteeType] = useState('');
  const [guaranteeEstimatedValue, setGuaranteeEstimatedValue] = useState('');

  const onGuaranteeTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setGuaranteeType(v);
    setGuaranteeEstimatedValue('');
  };

  const scoring = useMemo(
    () =>
      computeCreditScoring({
        monthlyIncome: income,
        additionalIncome,
        rentMortgage,
        otherCharges,
        loanPayment: existingLoanPayment,
        creditAmount: amount,
        durationMonths: duration,
        guaranteeEstimatedValue: Math.max(0, Number(String(guaranteeEstimatedValue).replace(/\s/g, '')) || 0),
      }),
    [amount, duration, income, additionalIncome, rentMortgage, otherCharges, existingLoanPayment, guaranteeEstimatedValue]
  );

  const monthlyRate = ANNUAL_RATE / 12;
  const monthlyPayment =
    amount > 0 && duration > 0
      ? (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) /
        (Math.pow(1 + monthlyRate, duration) - 1)
      : 0;
  const totalCost = monthlyPayment * duration;
  const totalInterest = totalCost - amount;

  const totalIncome = (income || 0) + (additionalIncome || 0);
  const totalExistingCharges = (rentMortgage || 0) + (otherCharges || 0) + (existingLoanPayment || 0);
  const debtRatioTotal =
    totalIncome > 0 ? ((monthlyPayment + totalExistingCharges) / totalIncome) * 100 : 0;

  // Montant max recommandé (33% du revenu net pour la mensualité, charges existantes déduites)
  const maxAffordablePayment =
    totalIncome > 0 ? (totalIncome * MAX_DEBT_RATIO_GOOD) / 100 - totalExistingCharges : 0;
  let maxRecommendedAmount = 0;
  if (maxAffordablePayment > 0 && duration > 0) {
    maxRecommendedAmount =
      (maxAffordablePayment * (Math.pow(1 + monthlyRate, duration) - 1)) /
      (monthlyRate * Math.pow(1 + monthlyRate, duration));
  }

  const currencyLabel = currency === 'TND' ? ' TND' : ` ${currency}`;
  const fmt = (n: number) => n.toLocaleString(isFr ? 'fr-FR' : 'en-US', { maximumFractionDigits: 0 });

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isFr ? 'Paramètres du crédit' : 'Credit parameters'}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Colonne 1 : Montant et durée */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Montant du crédit' : 'Credit amount'}
            </label>
            <input
              type="range"
              min="5000"
              max="2000000"
              step="5000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-lg font-semibold text-gray-900 mt-1">{fmt(amount)}{currencyLabel}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Durée du crédit' : 'Duration'}
            </label>
            <input
              type="range"
              min="12"
              max="300"
              step="6"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-gray-700 mt-1">
              {duration} {isFr ? 'mois' : 'months'} ({Math.round(duration / 12)} {isFr ? 'ans' : 'years'})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Revenu mensuel net (TND)' : 'Monthly net income'}
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={income || ''}
              onChange={(e) => setIncome(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Autres revenus (TND/mois)' : 'Other income (monthly)'}
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={additionalIncome || ''}
              onChange={(e) => setAdditionalIncome(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        {/* Colonne 2 : Charges et situation */}
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Loyer (TND/mois)' : 'Rent (per month)'}
            </label>
            <input
              type="number"
              min={0}
              value={rentMortgage || ''}
              onChange={(e) => setRentMortgage(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Autres charges mensuelles (TND)' : 'Other monthly charges'}
            </label>
            <input
              type="number"
              min={0}
              value={otherCharges || ''}
              onChange={(e) => setOtherCharges(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Mensualités des crédits en cours (TND)' : 'Existing loan payments'}
            </label>
            <input
              type="number"
              min={0}
              value={existingLoanPayment || ''}
              onChange={(e) => setExistingLoanPayment(Number(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Situation professionnelle' : 'Employment status'}
            </label>
            <select
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Salarié(e)">Salarié(e)</option>
              <option value="Indépendant(e)">Indépendant(e)</option>
              <option value="Retraité(e)">Retraité(e)</option>
              <option value="Sans emploi">Sans emploi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Objet du crédit' : 'Purpose of credit'}
            </label>
            <select
              value={creditPurpose}
              onChange={(e) => setCreditPurpose(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Achat immobilier">{isFr ? 'Achat immobilier' : 'Real estate'}</option>
              <option value="Achat véhicule">{isFr ? 'Achat véhicule' : 'Vehicle'}</option>
              <option value="Travaux">{isFr ? 'Travaux / rénovation' : 'Renovation'}</option>
              <option value="Autre">{isFr ? 'Autre' : 'Other'}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Type de garantie' : 'Guarantee type'}
            </label>
            <select
              value={guaranteeType}
              onChange={onGuaranteeTypeChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{isFr ? 'Choisir' : 'Choose'}</option>
              {GUARANTEE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {guaranteeSelectOptionShortLabel(opt)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isFr ? 'Valeur estimative de la garantie (TND)' : 'Estimated guarantee value'}
            </label>
            <input
              type="number"
              min={0}
              step={100}
              value={guaranteeEstimatedValue}
              onChange={(e) => setGuaranteeEstimatedValue(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={isFr ? 'Saisir la valeur en TND' : 'Enter value in TND'}
            />
            <p className="text-xs text-gray-500 mt-1">
              {isFr
                ? 'Utilisée dans le score comme à la demande (ratio garantie ÷ montant).'
                : 'Used in the score like the application (guarantee ÷ amount).'}
            </p>
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{isFr ? 'Résultats de la simulation' : 'Simulation results'}</h3>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700">{isFr ? 'Mensualité estimée' : 'Estimated payment'}</span>
              <span className="text-2xl font-bold text-blue-600">{fmt(monthlyPayment)}{currencyLabel}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700">{isFr ? 'Coût total (capital + intérêts)' : 'Total cost'}</span>
              <span className="text-lg font-semibold text-gray-900">{fmt(totalCost)}{currencyLabel}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700">{isFr ? 'Intérêts totaux' : 'Total interest'}</span>
              <span className="text-lg font-semibold text-gray-700">{fmt(totalInterest)}{currencyLabel}</span>
            </div>
            <p className="text-xs text-gray-500">
              {isFr ? 'Taux annuel indicatif :' : 'Indicative annual rate:'} {(ANNUAL_RATE * 100).toFixed(1)} %
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700">{isFr ? 'Revenu total pris en compte' : 'Total income used'}</span>
              <span className="text-lg font-semibold text-gray-900">{fmt(totalIncome)}{currencyLabel}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
              <span className="text-gray-700">{isFr ? 'Charges existantes (hors nouveau crédit)' : 'Existing charges'}</span>
              <span className="text-lg font-semibold text-gray-900">{fmt(totalExistingCharges)}{currencyLabel}</span>
            </div>
            <div className="flex justify-between items-center p-4 rounded-xl border-2 border-amber-200 bg-amber-50/50">
              <span className="text-gray-700 font-medium">{isFr ? 'Taux d\'endettement (avec ce crédit)' : 'Debt ratio (with this credit)'}</span>
              <span
                className={`text-xl font-bold ${
                  debtRatioTotal < MAX_DEBT_RATIO_GOOD
                    ? 'text-green-600'
                    : debtRatioTotal < MAX_DEBT_RATIO_ACCEPTABLE
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              >
                {debtRatioTotal.toFixed(1)} %
              </span>
            </div>
            {maxRecommendedAmount > 0 && amount > maxRecommendedAmount && (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg">
                {isFr
                  ? `Montant max recommandé (33 % d'endettement) : ${fmt(Math.round(maxRecommendedAmount))} ${currency.trim()}`
                  : `Max recommended amount (33% ratio): ${fmt(Math.round(maxRecommendedAmount))} ${currency.trim()}`}
              </p>
            )}
          </div>
        </div>

        {/* Score (même logique que la demande en ligne) */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide block">
                {isFr ? 'Score indicatif (même calcul que la demande)' : 'Indicative score (same as application)'}
              </span>
              <p className="text-xs text-gray-600 mt-1 max-w-xl">
                {isFr
                  ? `Deux critères : taux d’endettement (charges + mensualité du nouveau crédit à ${(SCORING_ANNUAL_RATE_INDICATIVE * 100).toFixed(0)} % indicatif) ÷ revenus mensuels totaux — max 60 pts ; garantie estimée ÷ montant demandé — max 40 pts.`
                  : `Two factors: debt ratio (charges + new loan at ${(SCORING_ANNUAL_RATE_INDICATIVE * 100).toFixed(0)}% indicative) ÷ monthly income — max 60 pts; estimated guarantee ÷ loan amount — max 40 pts.`}
              </p>
            </div>
            <ScoreBadge score={scoring.totalScore} category={scoring.category} size="lg" />
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3 shadow-inner overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                scoring.totalScore >= 70
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : scoring.totalScore >= 50
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                    : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, scoring.totalScore))}%` }}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-xs text-gray-700">
            {scoring.components.map((c) => (
              <div key={c.id} className="flex justify-between gap-2 bg-white/60 rounded-lg px-2 py-1.5 border border-blue-100">
                <span className="truncate" title={c.title}>
                  {c.title}
                </span>
                <span className="font-semibold text-blue-900 shrink-0">
                  {c.points}/{c.maxPoints}
                </span>
              </div>
            ))}
          </div>
          {scoring.guaranteeToLoanPercent != null && (
            <p className="text-xs text-gray-600">
              {isFr ? 'Couverture garantie ÷ montant (score) :' : 'Guarantee ÷ loan (score):'}{' '}
              <strong>{scoring.guaranteeToLoanPercent} %</strong>
            </p>
          )}
          {debtRatioTotal >= MAX_DEBT_RATIO_ACCEPTABLE && totalIncome > 0 && (
            <p className="text-sm text-gray-600">
              {isFr
                ? "Réduire le montant ou allonger la durée peut améliorer le score (taux d'endettement avec le nouveau crédit)."
                : 'Lower amount or longer duration may improve the score (debt ratio with new credit).'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
