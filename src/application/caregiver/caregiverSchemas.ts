import { z } from 'zod';

export const medicationSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es obligatorio')
    .max(120, 'El nombre no puede superar 120 caracteres'),
  dose: z
    .string()
    .min(1, 'La dosis es obligatoria')
    .max(60, 'La dosis no puede superar 60 caracteres'),
  frequency: z
    .string()
    .min(1, 'La frecuencia es obligatoria')
    .max(80, 'La frecuencia no puede superar 80 caracteres'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  /** Empty string means "sin intervalo fijo" — coerced to undefined before submit. */
  intervalHours: z.string().optional(),
});

export type MedicationFormValues = z.infer<typeof medicationSchema>;

export const appointmentSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(120, 'El título no puede superar 120 caracteres'),
  type: z.enum(['consulta', 'examen', 'procedimiento', 'teleconsulta'], {
    error: 'Selecciona el tipo de cita',
  }),
  scheduledAt: z
    .string()
    .min(1, 'La fecha y hora son obligatorias'),
  notes: z
    .string()
    .max(500, 'Las notas no pueden superar 500 caracteres')
    .optional(),
});

export type AppointmentFormValues = z.infer<typeof appointmentSchema>;
