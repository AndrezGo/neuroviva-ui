'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BackButton } from '@/presentation/ui/BackButton';
import { TextField } from '@/presentation/ui/TextField';
import { Button } from '@/presentation/ui/Button';
import { Textarea } from '@/presentation/ui/Textarea';
import {
  medicationSchema,
  medicationEditSchema,
  type MedicationFormValues,
} from '@/application/caregiver/caregiverSchemas';

interface MedicationFormScreenProps {
  mode: 'create' | 'edit';
  onSubmit: (values: MedicationFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  submitError: string | null;
  initialValues?: Partial<MedicationFormValues>;
}

/**
 * Pure UI form screen for creating or editing a medication.
 * Owns its own RHF instance; the page wires in onSubmit and navigation.
 * Mode determines the resolver, heading, and button label.
 */
export function MedicationFormScreen({
  mode,
  onSubmit,
  isSubmitting,
  submitError,
  initialValues,
}: MedicationFormScreenProps) {
  const baseDefaults: MedicationFormValues = {
    name: '',
    dose: '',
    frequency: '',
    startDate: '',
    endDate: '',
    prescribingDoctorName: '',
    notes: '',
  };

  // Merge base defaults with initialValues; coerce null → '' for controlled inputs.
  const mergedDefaults: MedicationFormValues = {
    ...baseDefaults,
    ...initialValues,
    // Ensure nullable API fields never reach RHF as null (would make inputs uncontrolled)
    startDate: initialValues?.startDate ?? '',
    endDate: initialValues?.endDate ?? '',
    prescribingDoctorName: initialValues?.prescribingDoctorName ?? '',
    notes: initialValues?.notes ?? '',
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(mode === 'edit' ? medicationEditSchema : medicationSchema),
    defaultValues: mergedDefaults,
  });

  const onFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  const isEdit = mode === 'edit';

  return (
    <div className="flex flex-1 flex-col px-6 py-6">
      {/* Back navigation */}
      <div className="mb-6">
        <BackButton label="Volver a medicamentos" />
      </div>

      <h1 className="text-2xl font-black tracking-tight text-brand-dark mb-8">
        {isEdit ? 'Editar medicamento' : 'Nuevo medicamento'}
      </h1>

      <form
        onSubmit={onFormSubmit}
        noValidate
        className="flex flex-col gap-5"
      >
        <TextField
          label="Nombre del medicamento"
          placeholder="Nombre del medicamento"
          autoComplete="off"
          error={errors.name?.message}
          {...register('name')}
        />

        <TextField
          label="Dosis"
          placeholder="10 mg"
          autoComplete="off"
          error={errors.dose?.message}
          {...register('dose')}
        />

        <TextField
          label="Frecuencia"
          placeholder="Cada 8 horas"
          autoComplete="off"
          error={errors.frequency?.message}
          {...register('frequency')}
        />

        <TextField
          label="Nombre del médico que lo formula"
          placeholder="Dr. Ramírez"
          autoComplete="off"
          error={errors.prescribingDoctorName?.message}
          {...register('prescribingDoctorName')}
        />

        <TextField
          label={isEdit ? 'Fecha inicio' : 'Fecha inicio (opcional)'}
          type="date"
          error={errors.startDate?.message}
          {...register('startDate')}
        />

        <TextField
          label="Fecha fin (opcional)"
          type="date"
          error={errors.endDate?.message}
          {...register('endDate')}
        />

        <Textarea
          label="Notas"
          placeholder="Ajuste al tratamiento a partir de 30/06/2026"
          rows={4}
          error={errors.notes?.message}
          {...register('notes')}
        />

        {/* Form-level error */}
        {submitError && (
          <div
            role="alert"
            className="rounded-2xl border border-error-light bg-error-light px-4 py-3"
          >
            <p className="text-sm font-medium text-error">{submitError}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isSubmitting}
        >
          {isEdit ? 'Guardar cambios' : 'Guardar medicamento'}
        </Button>
      </form>
    </div>
  );
}
