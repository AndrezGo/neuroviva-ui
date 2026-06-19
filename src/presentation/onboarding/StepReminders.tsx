'use client';

import type { ReactNode } from 'react';
import { Pill, CalendarDays, CheckCircle2 } from 'lucide-react';

function InfoCard({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white/8 px-4 py-4 border border-white/10">
      <div className="flex-shrink-0 text-brand-primary">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-1 text-brand-primary">
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-semibold">Activado</span>
      </div>
    </div>
  );
}

export function StepReminders() {
  return (
    <section className="flex flex-col gap-6 px-4 pt-4 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          Recordatorios suaves
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          Recibirás estas alertas. Son parte del acompañamiento y están siempre activas.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <InfoCard
          icon={<Pill className="h-5 w-5" aria-hidden="true" />}
          title="Tomas de medicamentos"
          subtitle="Recordatorio en el horario de tomas"
        />
        <InfoCard
          icon={<CalendarDays className="h-5 w-5" aria-hidden="true" />}
          title="Citas y procedimientos"
          subtitle="Avisos antes de cada cita médica"
        />
      </div>
    </section>
  );
}
