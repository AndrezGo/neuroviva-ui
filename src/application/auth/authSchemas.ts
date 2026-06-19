import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

/**
 * Colombian WhatsApp number: +57 followed by 10 digits (mobile starts with 3xx).
 * Accepts formats: +573001234567, +57 300 1234567, +57 300 123 4567, 3001234567
 */
const colombianPhoneRegex = /^(\+57[\s-]?)?3\d{2}[\s-]?\d{3}[\s-]?\d{4}$/;

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),
  phone: z
    .string()
    .min(1, 'El celular es obligatorio')
    .regex(colombianPhoneRegex, 'Ingresa un número colombiano válido (+57 300 000 0000)'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener mínimo 8 caracteres')
    .max(128, 'La contraseña es demasiado larga'),
  habeasData: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debes aceptar el tratamiento de datos para continuar',
    }),
});

export type SignUpFormValues = z.infer<typeof signUpSchema>;

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .email('Ingresa un correo electrónico válido'),
});

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
