'use client';

import { BookOpen, Headphones, Gamepad2, Users } from 'lucide-react';

interface SectionCard {
  icon: React.ReactNode;
  title: string;
}

const SECTIONS: SectionCard[] = [
  {
    icon: <BookOpen className="h-6 w-6" aria-hidden="true" />,
    title: 'Recursos',
  },
  {
    icon: <Headphones className="h-6 w-6" aria-hidden="true" />,
    title: 'Podcasts',
  },
  {
    icon: <Gamepad2 className="h-6 w-6" aria-hidden="true" />,
    title: 'Juegos',
  },
  {
    icon: <Users className="h-6 w-6" aria-hidden="true" />,
    title: 'Red Social',
  },
];

/**
 * Patient home screen showing upcoming features as "Próximamente" cards.
 * Pure presentational component — receives no props, all sections are static.
 */
export function PatientHomeScreen() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div>
        <h2 className="text-lg font-black tracking-tight text-brand-dark">
          Tu espacio
        </h2>
        <p className="mt-0.5 text-sm text-gray-text">
          Estas secciones estarán disponibles muy pronto.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {SECTIONS.map((section) => (
          <div
            key={section.title}
            aria-disabled="true"
            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 opacity-70 cursor-not-allowed select-none"
          >
            {/* Icon badge */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary">
              {section.icon}
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-brand-dark leading-tight">
                {section.title}
              </p>
              <span className="inline-block self-start rounded-full bg-brand-primary-light px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-primary">
                Próximamente
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
