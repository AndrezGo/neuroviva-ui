'use client';

import { ChoiceChip, ChoiceChipGroup } from '@/presentation/ui/ChoiceChip';
import type { CaregiverCondition } from '@/domain/onboarding/onboarding.types';

interface ConditionOption {
  label: string;
  value: CaregiverCondition;
}

const CONDITION_OPTIONS: ConditionOption[] = [
  { label: 'Alzheimer', value: 'alzheimer' },
  { label: 'Parkinson', value: 'parkinson' },
  { label: 'Demencia (DCL)', value: 'dementia_mci' },
  { label: 'ELA', value: 'als' },
  { label: 'Huntington', value: 'huntington' },
  { label: 'Otra', value: 'other' },
];

interface StepConditionProps {
  conditions: CaregiverCondition[];
  onConditionsChange: (conditions: CaregiverCondition[]) => void;
}

export function StepCondition({ conditions, onConditionsChange }: StepConditionProps) {
  const handleSelect = (value: string) => {
    const condition = value as CaregiverCondition;
    if (conditions.includes(condition)) {
      onConditionsChange(conditions.filter((c) => c !== condition));
    } else {
      onConditionsChange([...conditions, condition]);
    }
  };

  return (
    <section className="flex flex-col gap-6 px-4 pt-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          ¿A quién acompañas?
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Puedes elegir una o varias. Adaptaremos guías y recordatorios.
        </p>
      </div>

      <ChoiceChipGroup aria-label="Condición del paciente" multiple>
        {CONDITION_OPTIONS.map((opt) => (
          <ChoiceChip
            key={opt.value}
            label={opt.label}
            value={opt.value}
            selected={conditions.includes(opt.value)}
            onSelect={handleSelect}
            multiple
          />
        ))}
      </ChoiceChipGroup>
    </section>
  );
}
