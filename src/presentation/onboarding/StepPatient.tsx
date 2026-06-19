'use client';

import { ChoiceChip, ChoiceChipGroup } from '@/presentation/ui/ChoiceChip';

const RELATION_OPTIONS = [
  { label: 'Madre', value: 'madre' },
  { label: 'Padre', value: 'padre' },
  { label: 'Abuelo/a', value: 'abuelo_a' },
  { label: 'Hermano/a', value: 'hermano_a' },
  { label: 'Otra', value: 'otra' },
];

interface StepPatientProps {
  patientName: string;
  onPatientNameChange: (name: string) => void;
  relation: string | null;
  onRelationChange: (relation: string | null) => void;
}

export function StepPatient({
  patientName,
  onPatientNameChange,
  relation,
  onRelationChange,
}: StepPatientProps) {
  const handleRelationSelect = (value: string) => {
    // Deselect if already selected (toggle off)
    onRelationChange(relation === value ? null : value);
  };

  return (
    <section className="flex flex-col gap-6 px-4 pt-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          ¿A quién vas a acompañar?
        </h1>
        <p className="mt-1 text-sm text-gray-400">Cuéntanos de tu ser querido.</p>
      </div>

      <div className="flex flex-col gap-5">
        {/* Patient name field — dark-themed overrides via className */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-300 tracking-tight">
            Nombre del paciente
          </label>
          <input
            type="text"
            value={patientName}
            onChange={(e) => onPatientNameChange(e.target.value)}
            placeholder="Ej. Carmen"
            autoComplete="off"
            className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-3.5 text-base text-white placeholder:text-gray-400/60 transition-all duration-200 hover:border-brand-primary/50 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark"
          />
        </div>

        {/* Relation chips */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-gray-300 tracking-tight">
            Relación <span className="font-normal text-gray-400">(opcional)</span>
          </p>
          <ChoiceChipGroup aria-label="Relación con el paciente">
            {RELATION_OPTIONS.map((opt) => (
              <ChoiceChip
                key={opt.value}
                label={opt.label}
                value={opt.value}
                selected={relation === opt.value}
                onSelect={handleRelationSelect}
              />
            ))}
          </ChoiceChipGroup>
        </div>
      </div>
    </section>
  );
}
