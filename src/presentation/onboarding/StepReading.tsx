'use client';

import { ToggleCard } from '@/presentation/ui/ToggleCard';

interface StepReadingProps {
  largeText: boolean;
  onLargeTextChange: (value: boolean) => void;
  highContrast: boolean;
  onHighContrastChange: (value: boolean) => void;
}

export function StepReading({
  largeText,
  onLargeTextChange,
  highContrast,
  onHighContrastChange,
}: StepReadingProps) {
  return (
    <section className="flex flex-col gap-6 px-4 pt-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          Ajustemos la lectura
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Para que todo se vea cómodo y claro.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <ToggleCard
          title="Texto más grande"
          subtitle="Recomendado para adultos mayores"
          checked={largeText}
          onCheckedChange={onLargeTextChange}
        />
        <ToggleCard
          title="Alto contraste"
          subtitle="Mejor legibilidad"
          checked={highContrast}
          onCheckedChange={onHighContrastChange}
        />
      </div>
    </section>
  );
}
