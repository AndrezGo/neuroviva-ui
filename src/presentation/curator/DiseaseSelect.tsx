'use client';

import { cn } from '@/shared/lib/cn';
import type { Disease } from '@/domain/content/content.types';

interface DiseaseSelectProps {
  id: string;
  label: string;
  diseases: Disease[];
  value: string;
  onChange: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

/**
 * Presentational disease selector.
 * No hooks, no API calls — receives all data via props.
 * Mirrors the styled select markup used for resource type in DoctorCuratoriaScreen.
 */
export function DiseaseSelect({
  id,
  label,
  diseases,
  value,
  onChange,
  isLoading = false,
  disabled = false,
}: DiseaseSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-sm font-semibold tracking-tight text-brand-dark"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className={cn(
          'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5',
          'text-base text-brand-dark',
          'transition-all duration-200',
          'hover:border-brand-primary/50',
          'focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
          'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
        )}
      >
        <option value="">
          {isLoading ? 'Cargando condiciones…' : 'Sin condición específica / general'}
        </option>
        {diseases.map((disease) => (
          <option key={disease.id} value={disease.id}>
            {disease.name}
            {disease.category ? ` — ${disease.category}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
