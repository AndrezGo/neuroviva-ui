'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/cn';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      leadingIcon,
      trailingIcon,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const resolvedId = id ?? generatedId;
    const errorId = `${resolvedId}-error`;
    const helperId = `${resolvedId}-helper`;

    const describedBy = [
      error ? errorId : undefined,
      helperText ? helperId : undefined,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={resolvedId}
          className="text-sm font-semibold text-brand-dark tracking-tight"
        >
          {label}
        </label>

        <div className="relative flex items-center">
          {leadingIcon && (
            <span
              className="pointer-events-none absolute left-3.5 text-gray-text"
              aria-hidden="true"
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={resolvedId}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy || undefined}
            className={cn(
              'w-full min-w-0 rounded-2xl border bg-white px-4 py-3.5',
              'text-base text-brand-dark placeholder:text-gray-text/60',
              'border-gray-200 transition-all duration-200',
              'hover:border-brand-primary/50',
              'focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
              error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
              leadingIcon && 'pl-10',
              trailingIcon && 'pr-12',
              className,
            )}
            {...props}
          />

          {trailingIcon && (
            <span className="absolute right-3 flex items-center">{trailingIcon}</span>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-red-500">
            {error}
          </p>
        )}

        {helperText && !error && (
          <p id={helperId} className="text-xs text-gray-text">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
