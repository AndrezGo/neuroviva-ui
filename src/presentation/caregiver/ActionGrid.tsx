'use client';

import { Pill, Activity, Heart, Calendar } from 'lucide-react';
import { ActionCard } from './ActionCard';
import { routes } from '@/core/routing/routes';

/**
 * 2×2 grid of quick-action cards for the Caregiver Inicio screen.
 * Each card links to a feature section of the caregiver panel.
 */
export function ActionGrid() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <ActionCard
        tone="teal"
        icon={<Pill className="h-5 w-5" aria-hidden="true" />}
        title="Registrar toma"
        subtitle="Medicamentos"
        href={routes.caregiverMeds()}
      />
      <ActionCard
        tone="coral"
        icon={<Activity className="h-5 w-5" aria-hidden="true" />}
        title="Anotar síntoma"
        subtitle="Cómo estuvo"
        href={routes.caregiverSymptoms()}
      />
      {/* Mood card — points to symptoms until a dedicated mood route exists */}
      <ActionCard
        tone="purple"
        icon={<Heart className="h-5 w-5" aria-hidden="true" />}
        title="Cómo se siente"
        subtitle="Ánimo y notas"
        href={routes.caregiverSymptoms()}
      />
      <ActionCard
        tone="blue"
        icon={<Calendar className="h-5 w-5" aria-hidden="true" />}
        title="Ver agenda"
        subtitle="Citas y exámenes"
        href={routes.caregiverAgenda()}
      />
    </div>
  );
}
