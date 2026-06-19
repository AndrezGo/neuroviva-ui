'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';

interface WizardProgressProps {
  value: number;
  max?: number;
  'aria-label'?: string;
  className?: string;
}

export function WizardProgress({
  value,
  max = 100,
  'aria-label': ariaLabel = 'Progreso del asistente',
  className,
}: WizardProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={ariaLabel}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/15', className)}
    >
      <div
        className="h-full rounded-full bg-brand-primary transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
