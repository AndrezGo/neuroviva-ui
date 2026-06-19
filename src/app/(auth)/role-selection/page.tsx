'use client';

import { HeartHandshake, Stethoscope, User } from 'lucide-react';
import { RoleCard } from '@/presentation/ui/RoleCard';
import { Button } from '@/presentation/ui/Button';
import { useRoleSelection } from '@/application/role/useRoleSelection';
import type { UserRole } from '@/domain/auth/auth.types';

const roles: Array<{
  role: UserRole;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  accentClass: string;
}> = [
  {
    role: 'caregiver',
    icon: <HeartHandshake className="h-6 w-6" aria-hidden="true" />,
    title: 'Soy cuidador/a',
    subtitle: 'Acompaño y registro el día a día de un ser querido.',
    accentClass: 'bg-role-caregiver-light text-role-caregiver',
  },
  {
    role: 'professional',
    icon: <Stethoscope className="h-6 w-6" aria-hidden="true" />,
    title: 'Profesional de salud',
    subtitle: 'Hago seguimiento clínico y reviso evidencia.',
    accentClass: 'bg-role-professional-light text-role-professional',
  },
  {
    role: 'patient',
    icon: <User className="h-6 w-6" aria-hidden="true" />,
    title: 'Soy paciente',
    subtitle: 'Busco bienestar, recursos y tranquilidad.',
    accentClass: 'bg-role-patient-light text-role-patient',
  },
];

export default function RoleSelectionPage() {
  const { selectedRole, selectRole, confirm, isLoading, error } = useRoleSelection();

  return (
    <div className="flex flex-1 flex-col px-6 py-8">
      {/* Header */}
      <div className="animate-fade-up" style={{ animationDelay: '0ms' }}>
        <h1 className="text-3xl font-black tracking-tight text-brand-dark">
          ¿Cómo usarás NeuroViva?
        </h1>
        <p className="mt-2 text-base text-gray-text leading-relaxed">
          Personalizamos la experiencia según tu rol. Podrás cambiarlo luego.
        </p>
      </div>

      {/* Role cards */}
      <div
        className="animate-fade-up mt-8 flex flex-col gap-3"
        style={{ animationDelay: '80ms' }}
        role="radiogroup"
        aria-label="Selecciona tu rol en NeuroViva"
      >
        {roles.map(({ role, icon, title, subtitle, accentClass }, index) => (
          <div
            key={role}
            className="animate-fade-up"
            style={{ animationDelay: `${120 + index * 60}ms` }}
          >
            <RoleCard
              icon={icon}
              title={title}
              subtitle={subtitle}
              selected={selectedRole === role}
              onClick={() => selectRole(role)}
              accentClass={accentClass}
            />
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p
          className="animate-fade-up mt-4 text-sm text-red-600 text-center"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}

      {/* Confirm button */}
      <div
        className="animate-fade-up mt-auto pt-8"
        style={{ animationDelay: '360ms' }}
      >
        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedRole || isLoading}
          isLoading={isLoading}
          onClick={confirm}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
