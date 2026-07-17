'use client';

import { useState } from 'react';
import { BackButton } from '@/presentation/ui/BackButton';
import { Pills } from '@/presentation/ui/Pills';
import { ExamsListScreen } from './ExamsListScreen';
import { ClinicalNotesListScreen } from './ClinicalNotesListScreen';
import { FollowUpListScreen } from './FollowUpListScreen';

// ── Types ─────────────────────────────────────────────────────────────────────

type MedicalTab = 'exams' | 'notes' | 'followup';

const TAB_OPTIONS = [
  { value: 'exams' as const, label: 'Exámenes' },
  { value: 'notes' as const, label: 'Notas Clínicas' },
  { value: 'followup' as const, label: 'Seguimiento' },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface MedicalRecordScreenProps {
  patientId: string;
  mode: 'caregiver' | 'doctor';
  onBack?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Shared "Historial Médico" container consumed by both the caregiver and
 * doctor routes. Owns tab state; renders sub-screens based on active tab.
 * The route PAGE is responsible for rendering the role-specific tab bar —
 * this component never renders a tab bar.
 */
export function MedicalRecordScreen({ patientId, mode, onBack }: MedicalRecordScreenProps) {
  const [tab, setTab] = useState<MedicalTab>('exams');

  return (
    <main className="flex flex-1 flex-col px-5 lg:px-8 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full">
      {onBack && <BackButton className="mb-4" />}

      <h1 className="text-2xl lg:text-3xl font-black tracking-tight text-brand-dark mb-6">
        Historial Médico
      </h1>

      <div className="mb-6">
        <Pills
          ariaLabel="Segmentos del historial médico"
          options={TAB_OPTIONS}
          value={tab}
          onChange={setTab}
        />
      </div>

      {tab === 'exams' && <ExamsListScreen patientId={patientId} mode={mode} />}
      {tab === 'notes' && <ClinicalNotesListScreen patientId={patientId} mode={mode} />}
      {tab === 'followup' && <FollowUpListScreen patientId={patientId} mode={mode} />}
    </main>
  );
}
