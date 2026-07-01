'use client';

import { useId } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BackButton } from '@/presentation/ui/BackButton';
import { TextField } from '@/presentation/ui/TextField';
import { Button } from '@/presentation/ui/Button';
import { cn } from '@/shared/lib/cn';
import { appointmentSchema, type AppointmentFormValues } from '@/application/caregiver/caregiverSchemas';

interface AppointmentFormScreenProps {
  onSubmit: (values: AppointmentFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  submitError: string | null;
}

const APPOINTMENT_TYPES = [
  { value: 'consulta', label: 'Consulta' },
  { value: 'examen', label: 'Examen' },
  { value: 'procedimiento', label: 'Procedimiento' },
  { value: 'teleconsulta', label: 'Teleconsulta' },
] as const;

/**
 * Pure UI form screen for creating a new appointment.
 * Owns its own RHF instance; the page wires in onSubmit and navigation.
 */
export function AppointmentFormScreen({
  onSubmit,
  isSubmitting,
  submitError,
}: AppointmentFormScreenProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      type: '' as AppointmentFormValues['type'],
      scheduledAt: '',
      notes: '',
    },
  });

  const selectedType = watch('type');
  const notesId = useId();
  const notesErrorId = `${notesId}-error`;

  const onFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <div className="flex flex-1 flex-col px-5 lg:px-8 pt-6 lg:pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-10 lg:max-w-6xl lg:mx-auto lg:w-full">
      <div className="mb-6">
        <BackButton label="Volver a agenda" />
      </div>

      <h1 className="text-2xl font-black tracking-tight text-brand-dark mb-8">
        Nueva cita
      </h1>

      <form onSubmit={onFormSubmit} noValidate className="flex flex-col gap-5">
        <TextField
          label="Título"
          placeholder="Control Neurología"
          autoComplete="off"
          error={errors.title?.message}
          {...register('title')}
        />

        {/* Type chip selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-brand-dark tracking-tight">
            Tipo de cita
          </span>
          <div className="grid grid-cols-2 gap-2">
            {APPOINTMENT_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setValue('type', value, { shouldValidate: true })}
                className={cn(
                  'rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-150',
                  selectedType === value
                    ? 'border-brand-primary bg-brand-primary text-white'
                    : 'border-gray-200 bg-white text-brand-dark hover:border-brand-primary/50 hover:bg-brand-primary-light',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {errors.type && (
            <p role="alert" className="text-xs font-medium text-red-500">
              {errors.type.message}
            </p>
          )}
        </div>

        <TextField
          label="Fecha y hora"
          type="datetime-local"
          error={errors.scheduledAt?.message}
          {...register('scheduledAt')}
        />

        {/* Native textarea — styled to match TextField, a11y wired manually */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={notesId}
            className="text-sm font-semibold text-brand-dark tracking-tight"
          >
            Notas (opcional)
          </label>
          <textarea
            id={notesId}
            rows={4}
            aria-invalid={errors.notes ? 'true' : undefined}
            aria-describedby={errors.notes ? notesErrorId : undefined}
            placeholder="Información adicional sobre la cita"
            className={cn(
              'w-full rounded-2xl border bg-white px-4 py-3.5',
              'text-base text-brand-dark placeholder:text-gray-text/60',
              'border-gray-200 transition-all duration-200',
              'hover:border-brand-primary/50',
              'focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
              'resize-none',
              errors.notes && 'border-red-400 focus:border-red-500 focus:ring-red-200',
            )}
            {...register('notes')}
          />
          {errors.notes && (
            <p id={notesErrorId} role="alert" className="text-xs font-medium text-red-500">
              {errors.notes.message}
            </p>
          )}
        </div>

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
          Guardar cita
        </Button>
      </form>
    </div>
  );
}
