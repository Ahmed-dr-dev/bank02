'use client';

import { useState } from 'react';

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
  const debtRatioNewCreditOnly = totalIncome > 0 ? (monthlyPayment / totalIncome) * 100 : 0;
  const debtRatioTotal =
    totalIncome > 0 ? ((monthlyPayment + totalExistingCharges) / totalIncome) * 100 : 0;

  // Probabilité basée sur taux d'endettement total, stabilité emploi, et objet
  let acceptanceProbability = 0;
  if (totalIncome <= 0) acceptanceProbability = 0;
  else if (debtRatioTotal < MAX_DEBT_RATIO_GOOD) acceptanceProbability = 88;
  else if (debtRatioTotal < MAX_DEBT_RATIO_ACCEPTABLE) acceptanceProbability = 68;
  else if (debtRatioTotal < MAX_DEBT_RATIO_RISKY) acceptanceProbability = 38;
  else acceptanceProbability = 12;

  const employmentBonus =
    employmentStatus === 'Salarié(e)' ? 5 : employmentStatus === 'Retraité(e)' ? 3 : 0;
  const purposeBonus = creditPurpose === 'Achat immobilier' ? 4 : creditPurpose === 'Achat véhicule' ? 2 : 0;
  acceptanceProbability = Math.min(95, acceptanceProbability + employmentBonus + purposeBonus);

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
              {isFr ? 'Loyer / prêt en cours (TND/mois)' : 'Rent / existing mortgage'}
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

        {/* Probabilité d'acceptation */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
              {isFr ? "Probabilité d'acceptation (estimation)" : 'Acceptance probability (estimate)'}
            </span>
            <span
              className={`text-3xl font-bold ${
                acceptanceProbability > 70 ? 'text-green-600' : acceptanceProbability > 40 ? 'text-amber-600' : 'text-red-600'
              }`}
            >
              {acceptanceProbability} %
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-3 shadow-inner overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                acceptanceProbability > 70
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : acceptanceProbability > 40
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              }`}
              style={{ width: `${Math.min(100, acceptanceProbability)}%` }}
            />
          </div>
          {debtRatioTotal >= MAX_DEBT_RATIO_ACCEPTABLE && totalIncome > 0 && (
            <p className="text-sm text-gray-600 mt-3">
              {isFr
                ? "Réduire le montant ou allonger la durée peut améliorer vos chances (taux d'endettement &lt; 40 %)."
                : 'Lower amount or longer duration may improve chances (debt ratio &lt; 40%).'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
