'use client';

import { Check } from 'lucide-react';
import { Button } from '@/presentation/ui/Button';

interface StepDoneProps {
  userName: string;
  patientName: string;
  onFinish: () => void;
}

export function StepDone({ userName, patientName, onFinish }: StepDoneProps) {
  const title = userName ? `¡Todo listo, ${userName}!` : '¡Todo listo!';

  return (
    <section className="flex flex-col items-center gap-8 px-4 pt-6 pb-4 animate-fade-up text-center">
      {/* Teal check icon box with glow */}
      <div
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-primary shadow-[0_0_32px_0] shadow-brand-primary/40"
        aria-hidden="true"
      >
        <Check className="h-10 w-10 text-white" strokeWidth={3} />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold text-white leading-tight">{title}</h1>
        <p className="text-sm text-gray-400 leading-relaxed max-w-xs mx-auto">
          Configuramos tu espacio para acompañar a{' '}
          {patientName ? (
            <strong className="font-semibold text-white">{patientName}</strong>
          ) : (
            'tu ser querido'
          )}
          . Estamos contigo en cada paso.
        </p>
      </div>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onFinish}
        className="mt-2"
      >
        Entrar a NeuroViva
      </Button>
    </section>
  );
}
