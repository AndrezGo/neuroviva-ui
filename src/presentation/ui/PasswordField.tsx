'use client';

import * as React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { TextField } from './TextField';
import { cn } from '@/shared/lib/cn';

type PasswordFieldProps = Omit<
  React.ComponentPropsWithRef<typeof TextField>,
  'type' | 'trailingIcon'
>;

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, ...props }, ref) => {
    const [visible, setVisible] = React.useState(false);

    const toggleButton = (
      <button
        type="button"
        aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={visible}
        onClick={() => setVisible((v) => !v)}
        className={cn(
          'text-gray-text transition-colors hover:text-brand-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-1 rounded-md p-0.5',
        )}
      >
        {visible ? (
          <EyeOff className="h-5 w-5" aria-hidden="true" />
        ) : (
          <Eye className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
    );

    return (
      <TextField
        ref={ref}
        type={visible ? 'text' : 'password'}
        trailingIcon={toggleButton}
        className={className}
        {...props}
      />
    );
  },
);

PasswordField.displayName = 'PasswordField';
