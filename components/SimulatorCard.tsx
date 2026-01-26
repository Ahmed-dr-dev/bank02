'use client';

import { useState } from 'react';

export default function SimulatorCard() {
  const [amount, setAmount] = useState(200000);
  const [duration, setDuration] = useState(120);
  const [income, setIncome] = useState(10000);

  // Simple calculation formulas
  const interestRate = 0.045; // 4.5% annual
  const monthlyRate = interestRate / 12;
  const monthlyPayment = (amount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
                        (Math.pow(1 + monthlyRate, duration) - 1);
  const totalCost = monthlyPayment * duration;
  const debtRatio = (monthlyPayment / income) * 100;
  
  // Calculate acceptance probability based on debt ratio
  let acceptanceProbability = 0;
  if (debtRatio < 33) acceptanceProbability = 85;
  else if (debtRatio < 40) acceptanceProbability = 65;
  else if (debtRatio < 50) acceptanceProbability = 40;
  else acceptanceProbability = 15;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Credit Simulator</h2>
      
      <div className="space-y-6">
        {/* Amount Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Amount: {amount.toLocaleString()} MAD
          </label>
          <input
            type="range"
            min="50000"
            max="1000000"
            step="10000"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Duration Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration: {duration} months ({Math.round(duration / 12)} years)
          </label>
          <input
            type="range"
            min="12"
            max="240"
            step="12"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Income Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Income
          </label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your monthly income"
          />
        </div>

        {/* Results */}
        <div className="border-t pt-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Monthly Payment</span>
            <span className="text-2xl font-bold text-blue-600">
              {monthlyPayment.toLocaleString('en-US', { maximumFractionDigits: 0 })} MAD
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Cost</span>
            <span className="text-lg font-semibold text-gray-900">
              {totalCost.toLocaleString('en-US', { maximumFractionDigits: 0 })} MAD
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Debt Ratio</span>
            <span className={`text-lg font-semibold ${
              debtRatio < 33 ? 'text-green-600' : 
              debtRatio < 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {debtRatio.toFixed(1)}%
            </span>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">Acceptance Probability</span>
              <span className={`text-3xl font-bold ${
                acceptanceProbability > 70 ? 'text-green-600' :
                acceptanceProbability > 40 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {acceptanceProbability}%
              </span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-3 mt-4 shadow-inner">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  acceptanceProbability > 70 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  acceptanceProbability > 40 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' : 
                  'bg-gradient-to-r from-red-500 to-red-600'
                }`}
                style={{ width: `${acceptanceProbability}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
