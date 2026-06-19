'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

interface CheckboxProps {
  id?: string;
  label: React.ReactNode;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
  name?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ id, label, checked, defaultChecked, onChange, error, disabled, name }, ref) => {
    const generatedId = React.useId();
    const resolvedId = id ?? generatedId;
    const errorId = `${resolvedId}-error`;

    // Track internal checked state to drive checkmark visibility.
    // When `checked` is provided (controlled), sync from it.
    // When only `defaultChecked` is provided (uncontrolled), own the state locally.
    const isControlled = checked !== undefined;
    const [internalChecked, setInternalChecked] = React.useState(
      isControlled ? checked : (defaultChecked ?? false),
    );

    // Keep internal state in sync whenever the controlled prop changes.
    React.useEffect(() => {
      if (isControlled) {
        setInternalChecked(checked);
      }
    }, [isControlled, checked]);

    const isChecked = isControlled ? checked : internalChecked;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalChecked(e.target.checked);
      }
      onChange?.(e.target.checked);
    };

    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-start gap-3">
          <div className="relative mt-0.5 flex-shrink-0">
            <input
              ref={ref}
              type="checkbox"
              id={resolvedId}
              name={name}
              checked={checked}
              defaultChecked={defaultChecked}
              disabled={disabled}
              aria-invalid={error ? 'true' : undefined}
              aria-describedby={error ? errorId : undefined}
              onChange={handleChange}
              className="peer sr-only"
            />
            {/* Box styling is driven by peer-checked (sibling combinator works fine here). */}
            {/* Checkmark visibility is driven by React state because the icon is a  */}
            {/* descendant of the label sibling — peer-checked cannot reach descendants. */}
            <label
              htmlFor={resolvedId}
              className={cn(
                'flex h-5 w-5 cursor-pointer items-center justify-center',
                'rounded-md border-2 border-gray-300 bg-white',
                'transition-all duration-200',
                'peer-checked:border-brand-primary peer-checked:bg-brand-primary',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-primary peer-focus-visible:ring-offset-2',
                'peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
                error && 'border-red-400',
              )}
            >
              <Check
                className={cn(
                  'h-3 w-3 text-white transition-opacity',
                  isChecked ? 'opacity-100' : 'opacity-0',
                )}
                aria-hidden="true"
              />
            </label>
          </div>

          <label
            htmlFor={resolvedId}
            className={cn(
              'text-sm text-brand-dark leading-relaxed cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {label}
          </label>
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs font-medium text-red-500 pl-8">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = 'Checkbox';
