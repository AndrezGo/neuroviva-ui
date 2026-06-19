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
    formState: { errors },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      title: '',
      type: '',
      scheduledAt: '',
      notes: '',
    },
  });

  // IDs for the native <textarea> a11y wiring
  const notesId = useId();
  const notesErrorId = `${notesId}-error`;

  const onFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <div className="flex flex-1 flex-col px-6 py-6">
      {/* Back navigation */}
      <div className="mb-6">
        <BackButton label="Volver a agenda" />
      </div>

      <h1 className="text-2xl font-black tracking-tight text-brand-dark mb-8">
        Nueva cita
      </h1>

      <form
        onSubmit={onFormSubmit}
        noValidate
        className="flex flex-col gap-5"
      >
        <TextField
          label="Título"
          placeholder="Control Neurología"
          autoComplete="off"
          error={errors.title?.message}
          {...register('title')}
        />

        <TextField
          label="Tipo"
          placeholder="Consulta"
          autoComplete="off"
          error={errors.type?.message}
          {...register('type')}
        />

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
          Guardar cita
        </Button>
      </form>
    </div>
  );
}
