'use client';

import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { patientTabItems } from './navigation';

interface PatientHomeScreenProps {
  greeting: string;
  firstName: string;
}

/**
 * Patient home screen with real shortcut cards linking to the four main sections.
 * Derives the section list from patientTabItems (minus home) to stay in sync
 * with the navigation single source of truth.
 * Pure presentational component — no hooks, no API calls.
 */
export function PatientHomeScreen({ greeting, firstName }: PatientHomeScreenProps) {
  const sectionItems = patientTabItems.filter((item) => item.tab !== 'home');

  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <header className="hidden lg:block">
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-primary">
          {greeting}
        </span>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-dark">
          {firstName ? `Hola, ${firstName}` : 'Hola'}
        </h1>
      </header>

      <div>
        <h2 className="text-lg font-black tracking-tight text-brand-dark">
          Explora tu espacio
        </h2>
        <p className="mt-0.5 text-sm text-gray-text">
          Accede a noticias, canales, comunidad y artículos sobre tu salud.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {sectionItems.map(({ tab, label, href, Icon }) => (
          <Link
            key={tab}
            href={href}
            className={cn(
              'flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-4',
              'transition-colors duration-150',
              'hover:border-brand-primary/30 hover:bg-brand-primary-light/30',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
            )}
          >
            {/* Icon badge */}
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-light text-brand-primary"
              aria-hidden="true"
            >
              <Icon className="h-6 w-6" />
            </div>

            <p className="text-sm font-bold text-brand-dark leading-tight">
              {label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
