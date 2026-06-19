'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';
import { Toggle } from '@/presentation/ui/Toggle';

interface ToggleCardProps {
  title: string;
  subtitle: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ToggleCard({
  title,
  subtitle,
  checked,
  onCheckedChange,
  icon,
  disabled = false,
  className,
}: ToggleCardProps) {
  const labelId = React.useId();

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-2xl bg-white/8 px-4 py-4',
        'border border-white/10',
        className,
      )}
    >
      {icon && (
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-primary/20 text-brand-primary"
        >
          {icon}
        </span>
      )}

      <div className="flex-1 min-w-0">
        <p id={labelId} className="text-sm font-semibold text-white leading-tight">
          {title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{subtitle}</p>
      </div>

      <Toggle
        checked={checked}
        onChange={onCheckedChange}
        aria-labelledby={labelId}
        disabled={disabled}
      />
    </div>
  );
}
