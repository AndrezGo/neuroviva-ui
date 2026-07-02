'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BackButton } from '@/presentation/ui/BackButton';
import { TextField } from '@/presentation/ui/TextField';
import { Button } from '@/presentation/ui/Button';
import { medicationSchema, type MedicationFormValues } from '@/application/caregiver/caregiverSchemas';

interface MedicationFormScreenProps {
  onSubmit: (values: MedicationFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  submitError: string | null;
}

/**
 * Pure UI form screen for creating a new medication.
 * Owns its own RHF instance; the page wires in onSubmit and navigation.
 */
export function MedicationFormScreen({
  onSubmit,
  isSubmitting,
  submitError,
}: MedicationFormScreenProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      name: '',
      dose: '',
      frequency: '',
      startDate: '',
      endDate: '',
      intervalHours: '',
    },
  });

  const onFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <div className="flex flex-1 flex-col px-6 py-6">
      {/* Back navigation */}
      <div className="mb-6">
        <BackButton label="Volver a medicamentos" />
      </div>

      <h1 className="text-2xl font-black tracking-tight text-brand-dark mb-8">
        Nuevo medicamento
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

        <div className="flex flex-col gap-1.5">
          <label htmlFor="intervalHours" className="text-sm font-semibold text-brand-dark">
            Intervalo fijo (opcional)
          </label>
          <select
            id="intervalHours"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-brand-dark transition-colors focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20"
            {...register('intervalHours')}
          >
            <option value="">Sin intervalo fijo</option>
            <option value="4">Cada 4 horas</option>
            <option value="6">Cada 6 horas</option>
            <option value="8">Cada 8 horas</option>
            <option value="12">Cada 12 horas</option>
            <option value="24">Cada 24 horas</option>
          </select>
          <p className="text-xs text-gray-text">
            Si seleccionas un intervalo, mostraremos un contador de "próxima toma" en Inicio.
          </p>
        </div>

        <TextField
          label="Fecha inicio (opcional)"
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
          Guardar medicamento
        </Button>
      </form>
    </div>
  );
}
