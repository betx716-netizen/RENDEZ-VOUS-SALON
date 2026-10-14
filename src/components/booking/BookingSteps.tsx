import React from 'react';
import { Check } from 'lucide-react';

interface BookingStepsProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const BookingSteps: React.FC<BookingStepsProps> = ({
  currentStep,
  onStepClick,
}) => {
  const steps = [
    { number: 1, label: 'Prestation' },
    { number: 2, label: 'Coiffeur(se)' },
    { number: 3, label: 'Date & heure' },
    { number: 4, label: 'Vos infos' },
  ];

  return (
    <nav aria-label="Étapes de réservation">
      <ol className="flex items-center gap-2">
        {steps.map((s) => {
          const isDone = currentStep > s.number;
          const isCurrent = currentStep === s.number;
          const isClickable = onStepClick && currentStep > s.number;

          return (
            <li key={s.number} className={isCurrent ? 'flex-[2.2] min-w-0' : 'flex-1 min-w-0'}>
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick(s.number)}
                aria-current={isCurrent ? 'step' : undefined}
                className={`w-full flex items-center justify-center gap-2 px-2 h-11 rounded-full border-2 border-ink text-xs font-bold transition-all ${
                  isCurrent
                    ? 'bg-primary text-white shadow-hard-sm'
                    : isDone
                    ? 'bg-lime text-ink cursor-pointer hover:-translate-y-0.5'
                    : 'bg-surface text-ink/50'
                }`}
              >
                <span className="shrink-0">
                  {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : s.number}
                </span>
                {/* Libellé visible pour l'étape en cours, et partout sur grand écran */}
                <span className={`truncate ${isCurrent ? 'inline' : 'hidden sm:inline'}`}>{s.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
