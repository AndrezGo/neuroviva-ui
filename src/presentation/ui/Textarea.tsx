'use client';
import * as React from 'react';
import { cn } from '@/shared/lib/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
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

        <textarea
          ref={ref}
          id={resolvedId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy || undefined}
          className={cn(
            'w-full min-w-0 rounded-2xl border bg-white px-4 py-3.5',
            'text-base text-brand-dark placeholder:text-gray-text/60',
            'border-gray-200 transition-all duration-200 resize-none',
            'hover:border-brand-primary/50',
            'focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
            error && 'border-red-400 focus:border-red-500 focus:ring-red-200',
            className,
          )}
          {...props}
        />

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

Textarea.displayName = 'Textarea';
