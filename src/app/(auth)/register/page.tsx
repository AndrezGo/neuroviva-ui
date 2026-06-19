'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { BackButton } from '@/presentation/ui/BackButton';
import { TextField } from '@/presentation/ui/TextField';
import { PasswordField } from '@/presentation/ui/PasswordField';
import { Button } from '@/presentation/ui/Button';
import { Checkbox } from '@/presentation/ui/Checkbox';
import { useSignUp } from '@/application/auth/useSignUp';
import { signUpSchema, type SignUpFormValues } from '@/application/auth/authSchemas';
import { routes } from '@/core/routing/routes';

export default function RegisterPage() {
  const { signUp, isLoading, error } = useSignUp();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      habeasData: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await signUp(values);
  });

  const privacyLabel = (
    <span>
      Acepto el tratamiento de mis datos según la{' '}
      <a
        href="#"
        className="font-semibold text-brand-primary hover:text-brand-primary-dark underline underline-offset-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary rounded"
        onClick={(e) => e.stopPropagation()}
      >
        Política de Privacidad y Habeas Data
      </a>{' '}
      (Colombia).
    </span>
  );

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      {/* Top navigation */}
      <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
        <BackButton />
      </div>

      {/* Header */}
      <div className="animate-fade-up mt-8" style={{ animationDelay: '60ms' }}>
        <h1 className="text-3xl font-black tracking-tight text-brand-dark">Crear tu cuenta</h1>
        <p className="mt-2 text-base text-gray-text">Toma menos de un minuto.</p>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        noValidate
        className="animate-fade-up mt-8 flex flex-col gap-5"
        style={{ animationDelay: '120ms' }}
      >
        <TextField
          label="Nombre completo"
          type="text"
          autoComplete="name"
          placeholder="Laura Mejía"
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="tu@correo.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <TextField
          label="Celular (WhatsApp)"
          type="tel"
          autoComplete="tel"
          placeholder="+57 300 000 0000"
          error={errors.phone?.message}
          {...register('phone')}
        />

        <PasswordField
          label="Contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 8 caracteres"
          helperText="Mínimo 8 caracteres"
          error={errors.password?.message}
          {...register('password')}
        />

        <Controller
          name="habeasData"
          control={control}
          render={({ field }) => (
            <Checkbox
              label={privacyLabel}
              checked={field.value}
              onChange={field.onChange}
              name={field.name}
              error={errors.habeasData?.message}
            />
          )}
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
          Crear cuenta
        </Button>
      </form>

      {/* Footer */}
      <p
        className="animate-fade-up mt-auto pt-8 text-center text-sm text-gray-text"
        style={{ animationDelay: '180ms' }}
      >
        ¿Ya tienes cuenta?{' '}
        <Link
          href={routes.login()}
          className="font-semibold text-brand-primary hover:text-brand-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 rounded"
        >
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
