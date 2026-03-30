'use client';

import { useState } from 'react';

interface StepFormProps {
  steps: string[];
  children: React.ReactNode[];
  onSubmit: (data: unknown) => void;
  locale?: 'fr' | 'en';
  onValidateStep?: (stepIndex: number) => boolean | Promise<boolean>;
  submitDisabled?: boolean;
  /** Allow clicking any step indicator to jump directly to it (no validation gate) */
  freeNavigation?: boolean;
  /** Label override for the submit button */
  submitLabel?: string;
}

export default function StepForm({
  steps,
  children,
  onSubmit,
  locale = 'en',
  onValidateStep,
  submitDisabled = false,
  freeNavigation = false,
  submitLabel,
}: StepFormProps) {
  const isFr = locale === 'fr';
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    if (!freeNavigation && onValidateStep) {
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
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const handleJump = (index: number) => {
    if (freeNavigation) setCurrentStep(index);
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
                  onClick={() => handleJump(index)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 font-bold transition-all
                    ${index === currentStep
                      ? 'border-blue-600 bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg scale-110'
                      : index < currentStep
                        ? 'border-blue-400 bg-blue-50 text-blue-600'
                        : 'border-gray-300 bg-white text-gray-400'
                    }
                    ${freeNavigation ? 'cursor-pointer hover:scale-110' : ''}
                  `}
                >
                  {index < currentStep && !freeNavigation ? '✓' : index + 1}
                </div>
                <span
                  className={`mt-2 text-sm ${
                    index === currentStep
                      ? 'text-blue-600 font-semibold'
                      : index < currentStep
                        ? 'text-blue-400 font-medium'
                        : 'text-gray-400'
                  } ${freeNavigation ? 'cursor-pointer' : ''}`}
                  onClick={() => handleJump(index)}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${
                    index < currentStep ? 'bg-blue-400' : 'bg-gray-300'
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
          {isLastStep
            ? (submitLabel ?? (isFr ? 'Soumettre la demande' : 'Submit Application'))
            : (isFr ? 'Étape suivante' : 'Next Step')}
        </button>
      </div>
    </div>
  );
}
