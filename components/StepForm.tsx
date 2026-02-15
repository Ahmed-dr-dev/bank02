'use client';

import { useState } from 'react';

interface StepFormProps {
  steps: string[];
  children: React.ReactNode[];
  onSubmit: (data: unknown) => void;
  locale?: 'fr' | 'en';
  /** Si fourni, appelé avant de passer à l'étape suivante. Retourner false pour bloquer. */
  onValidateStep?: (stepIndex: number) => boolean | Promise<boolean>;
  /** Désactive le bouton de soumission (ex: envoi en cours) */
  submitDisabled?: boolean;
}

export default function StepForm({ steps, children, onSubmit, locale = 'en', onValidateStep, submitDisabled = false }: StepFormProps) {
  const isFr = locale === 'fr';
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (onValidateStep) {
      const ok = await Promise.resolve(onValidateStep(currentStep));
      if (!ok) return;
    }
    if (isLastStep) {
      onSubmit(formData);
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="w-full">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold transition-all ${
                    index <= currentStep
                      ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                      : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {index + 1}
                </div>
                <span
                  className={`mt-2 text-sm ${
                    index <= currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-gray-100">{children[currentStep]}</div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 0}
          className={`px-8 py-3 rounded-xl font-semibold transition-all ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300 shadow-md'
          }`}
        >
          {isFr ? 'Précédent' : 'Back'}
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={submitDisabled}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLastStep ? (isFr ? 'Soumettre la demande' : 'Submit Application') : (isFr ? 'Étape suivante' : 'Next Step')}
        </button>
      </div>
    </div>
  );
}
