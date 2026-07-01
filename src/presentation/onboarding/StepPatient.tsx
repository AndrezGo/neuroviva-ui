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
  relation: string | null;
  onRelationChange: (relation: string | null) => void;
}

export function StepPatient({ relation, onRelationChange }: StepPatientProps) {
  const handleRelationSelect = (value: string) => {
    // Deselect if already selected (toggle off)
    onRelationChange(relation === value ? null : value);
  };

  return (
    <section className="flex flex-col gap-6 px-4 pt-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          ¿Cuál es tu relación con el paciente?
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Esto es opcional, pero nos ayuda a personalizar tu experiencia.
        </p>
      </div>

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
    </section>
  );
}
