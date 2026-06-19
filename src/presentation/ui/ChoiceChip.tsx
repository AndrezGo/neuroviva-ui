'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';

// ── ChoiceChip ───────────────────────────────────────────────────────────────

interface ChoiceChipProps {
  label: string;
  value: string;
  selected: boolean;
  onSelect: (value: string) => void;
  disabled?: boolean;
  multiple?: boolean;
}

export function ChoiceChip({
  label,
  value,
  selected,
  onSelect,
  disabled = false,
  multiple = false,
}: ChoiceChipProps) {
  const handleClick = () => {
    if (!disabled) onSelect(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!disabled) onSelect(value);
    }
  };

  return (
    <button
      type="button"
      role={multiple ? 'checkbox' : 'radio'}
      aria-checked={selected}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-4 py-2',
        'text-sm font-semibold tracking-tight',
        'border-2 transition-all duration-200 active:scale-95',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark',
        'disabled:cursor-not-allowed disabled:opacity-50',
        selected
          ? 'border-brand-primary bg-brand-primary text-white shadow-sm'
          : 'border-white/20 bg-white/10 text-gray-300 hover:border-brand-primary/60 hover:bg-white/15',
      )}
    >
      {label}
    </button>
  );
}

// ── ChoiceChipGroup ──────────────────────────────────────────────────────────

interface ChoiceChipGroupProps {
  'aria-label': string;
  children: React.ReactNode;
  className?: string;
  multiple?: boolean;
}

export function ChoiceChipGroup({
  'aria-label': ariaLabel,
  children,
  className,
  multiple = false,
}: ChoiceChipGroupProps) {
  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={ariaLabel}
      className={cn('flex flex-wrap gap-2', className)}
    >
      {children}
    </div>
  );
}
