'use client';

import { ArrowLeft } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { WizardProgress } from '@/presentation/ui/WizardProgress';

interface OnboardingHeaderProps {
  onBack: () => void;
  onSkip?: () => void;
  progress: number;
  currentStep: number;
  totalSteps: number;
  /** Hide the "Omitir" skip link (e.g. on the final step). */
  hideSkip?: boolean;
}

export function OnboardingHeader({
  onBack,
  onSkip,
  progress,
  currentStep,
  totalSteps,
  hideSkip = false,
}: OnboardingHeaderProps) {
  return (
    <header className="flex flex-col gap-2 px-4 pt-4 pb-2">
      {/* Row: back button + progress bar + skip link */}
      <div className="flex items-center gap-3">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
            'bg-white/10 hover:bg-white/20 active:scale-95',
            'transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark',
          )}
        >
          <ArrowLeft className="h-5 w-5 text-white" aria-hidden="true" />
        </button>

        {/* Progress bar — grows to fill remaining space */}
        <div className="flex-1">
          <WizardProgress value={progress} />
        </div>

        {/* Skip link or spacer */}
        {!hideSkip ? (
          <button
            type="button"
            onClick={onSkip}
            aria-label="Omitir configuración"
            className={cn(
              'text-xs font-medium text-gray-400 hover:text-gray-300',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:rounded-sm',
              'w-12 text-right flex-shrink-0',
            )}
          >
            Omitir
          </button>
        ) : (
          // Keep same width as the skip link to maintain centering of the progress bar
          <div className="w-12 flex-shrink-0" aria-hidden="true" />
        )}
      </div>

      {/* Step label below the progress bar */}
      <p className="text-center text-xs font-bold uppercase tracking-wide text-brand-primary">
        PASO {currentStep} DE {totalSteps}
      </p>
    </header>
  );
}
