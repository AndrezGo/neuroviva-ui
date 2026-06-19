'use client';

import { useAuthStore } from '@/shared/store/useAuthStore';

interface RoleHomePlaceholderProps {
  /** Tabler/lucide icon element rendered inside the badge. */
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

/**
 * Temporary landing screen for each role until the real dashboards are built.
 * Greets the authenticated user by name when available.
 */
export function RoleHomePlaceholder({ icon, title, subtitle }: RoleHomePlaceholderProps) {
  const name =
    useAuthStore((s) => s.backendUser?.name ?? s.user?.fullName ?? null) ?? '';
  const firstName = name.split(' ')[0];

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-light text-brand-primary">
        {icon}
      </div>
      <h1 className="mt-6 text-2xl font-black tracking-tight text-brand-dark">
        {firstName ? `Hola, ${firstName}` : title}
      </h1>
      <p className="mt-2 max-w-xs text-base leading-relaxed text-gray-text">{subtitle}</p>
      <p className="mt-8 rounded-full bg-gray-100 px-4 py-2 text-xs font-medium text-gray-text">
        Próximamente: tu panel de {title.toLowerCase()}
      </p>
    </main>
  );
}
