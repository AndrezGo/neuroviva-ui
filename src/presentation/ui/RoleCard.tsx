'use client';

import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected?: boolean;
  onClick?: () => void;
  accentClass?: string;
}

export function RoleCard({
  icon,
  title,
  subtitle,
  selected = false,
  onClick,
  accentClass = 'bg-brand-primary-light text-brand-primary',
}: RoleCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        'w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2',
        'transition-all duration-200 active:scale-[0.99]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
        selected
          ? 'border-brand-primary bg-brand-primary-light/30 shadow-sm'
          : 'border-gray-200 bg-white hover:border-brand-primary/40 hover:bg-gray-50',
      )}
    >
      <span
        className={cn(
          'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl',
          accentClass,
        )}
        aria-hidden="true"
      >
        {icon}
      </span>

      <div className="flex-1 min-w-0">
        <p className={cn('font-bold text-base tracking-tight', selected ? 'text-brand-primary' : 'text-brand-dark')}>
          {title}
        </p>
        <p className="text-sm text-gray-text leading-snug mt-0.5">{subtitle}</p>
      </div>

      <ChevronRight
        className={cn(
          'h-5 w-5 flex-shrink-0 transition-transform duration-200',
          selected ? 'text-brand-primary translate-x-0.5' : 'text-gray-300',
        )}
        aria-hidden="true"
      />
    </button>
  );
}
