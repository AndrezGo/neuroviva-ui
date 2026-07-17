'use client';

import { cn } from '@/shared/lib/cn';

interface PillOption<T extends string> {
  value: T;
  label: string;
}

interface PillsProps<T extends string> {
  options: readonly PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/**
 * Generic segmented control (pill bar) for selecting among a fixed set of
 * string options. Each option renders as a full-width button within the group.
 */
export function Pills<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: PillsProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex flex-row gap-2"
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
              isActive
                ? 'bg-brand-primary text-white border-brand-primary'
                : 'bg-white text-brand-dark border-gray-200 hover:border-brand-primary/50',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
