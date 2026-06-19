'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import { BackButton } from '@/presentation/ui/BackButton';
import { TextField } from '@/presentation/ui/TextField';
import { Button } from '@/presentation/ui/Button';
import { InfoBox } from '@/presentation/ui/InfoBox';
import { useResetPassword } from '@/application/auth/useResetPassword';
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from '@/application/auth/authSchemas';

export default function ForgotPasswordPage() {
  const { resetPassword, isLoading, error, success } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    await resetPassword(values);
  });

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      {/* Top navigation */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
        <BackButton />
      </div>

      {/* Icon block */}
      <div
        className="animate-fade-up mt-8 flex justify-center"
        style={{ animationDelay: '60ms' }}
      >
        <div
          className="flex h-20 w-20 items-center justify-center rounded-3xl"
          style={{ backgroundColor: 'var(--color-brand-primary-light)' }}
        >
          <KeyRound
            className="h-10 w-10"
            style={{ color: 'var(--color-brand-primary)' }}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Header */}
      <div
        className="animate-fade-up mt-6 text-center"
        style={{ animationDelay: '120ms' }}
      >
        <h1 className="text-3xl font-black tracking-tight text-brand-dark">
          Recupera tu acceso
        </h1>
        <p className="mt-2 text-base text-gray-text leading-relaxed">
          Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva.
        </p>
      </div>

      {/* Success state */}
      {success ? (
        <div
          className="animate-fade-up mt-8 flex flex-col items-center gap-4 rounded-3xl border border-brand-primary/20 bg-brand-primary-light p-6 text-center"
          style={{ animationDelay: '0ms' }}
          role="alert"
        >
          <CheckCircle2
            className="h-10 w-10"
            style={{ color: 'var(--color-brand-primary)' }}
            aria-hidden="true"
          />
          <div>
            <p className="font-bold text-brand-dark">¡Enlace enviado!</p>
            <p className="mt-1 text-sm text-gray-text">
              Revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          noValidate
          className="animate-fade-up mt-8 flex flex-col gap-5"
          style={{ animationDelay: '180ms' }}
        >
          <TextField
            label="Correo electrónico"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Form-level error */}
          {error && (
            <div
              role="alert"
              className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-medium text-red-600"
            >
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
          >
            Enviar enlace
          </Button>
        </form>
      )}

      {/* Info box */}
      <div
        className="animate-fade-up mt-6"
        style={{ animationDelay: '240ms' }}
      >
        <InfoBox>
          Revisa también tu carpeta de correo no deseado.
        </InfoBox>
      </div>
    </div>
  );
}
