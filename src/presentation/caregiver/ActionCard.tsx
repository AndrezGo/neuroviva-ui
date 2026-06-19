'use client';

import Link from 'next/link';
import { cn } from '@/shared/lib/cn';

type ActionTone = 'teal' | 'coral' | 'purple' | 'blue';

interface ActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone: ActionTone;
  href: string;
}

const toneClasses: Record<ActionTone, { bg: string; text: string }> = {
  teal: { bg: 'bg-brand-primary-light', text: 'text-brand-primary' },
  coral: { bg: 'bg-error-light', text: 'text-error' },
  purple: { bg: 'bg-role-patient-light', text: 'text-role-patient' },
  blue: { bg: 'bg-role-professional-light', text: 'text-role-professional' },
};

/**
 * Reusable quick-action card linking to a caregiver feature.
 * Icon is displayed in a tone-colored rounded square; accessible name is the title.
 */
export function ActionCard({ icon, title, subtitle, tone, href }: ActionCardProps) {
  const { bg, text } = toneClasses[tone];

  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4',
        'transition-shadow duration-150 hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
      )}
      aria-label={`${title} — ${subtitle}`}
    >
      {/* Icon container */}
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-xl',
          bg,
          text,
        )}
        aria-hidden="true"
      >
        {icon}
      </div>

      {/* Text */}
      <div>
        <p className="text-sm font-bold text-brand-dark">{title}</p>
        <p className="text-xs text-gray-text">{subtitle}</p>
      </div>
    </Link>
  );
}
