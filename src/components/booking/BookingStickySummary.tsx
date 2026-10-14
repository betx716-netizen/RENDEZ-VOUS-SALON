import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Service } from '../../types/database';
import { CalculatedSlot } from '../../lib/slot-calculator';
import { formatFCFA, formatHeure, formatDateShort } from '../../lib/utils';

interface BookingStickySummaryProps {
  service: Service | null;
  slot: CalculatedSlot | null;
  step: number;
  onNext: () => void;
  canContinue: boolean;
  submitting?: boolean;
}

export const BookingStickySummary: React.FC<BookingStickySummaryProps> = ({
  service,
  slot,
  step,
  onNext,
  canContinue,
  submitting = false,
}) => {
  if (step >= 5 || !service) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t-2 border-ink px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:hidden">
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
        <div className="truncate pr-2">
          <div className="text-sm font-bold text-ink truncate">
            {service.nom}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span className="font-bold text-ink bg-sun px-1.5 rounded">{formatFCFA(service.prix_fcfa)}</span>
            {slot && (
              <span className="font-medium">{formatDateShort(slot.debut)} · {formatHeure(slot.debut)}</span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!canContinue || submitting}
          onClick={onNext}
          className={`press inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full border-2 border-ink font-bold text-sm shadow-hard-md min-h-[48px] shrink-0 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ${
            step === 4 ? 'bg-lime text-ink' : 'bg-primary text-white'
          }`}
        >
          <span>{step === 4 ? (submitting ? 'Validation...' : 'Confirmer') : 'Continuer'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
