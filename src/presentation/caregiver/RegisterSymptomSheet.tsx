'use client';

import { useState, useEffect } from 'react';
import { Sheet } from '@/presentation/ui/Sheet';
import { Button } from '@/presentation/ui/Button';
import { Textarea } from '@/presentation/ui/Textarea';
import { cn } from '@/shared/lib/cn';

// ── Constants ─────────────────────────────────────────────────────────────────

const SYMPTOM_TYPES = [
  { value: 'agitacion', label: 'Agitación' },
  { value: 'apetito', label: 'Apetito' },
  { value: 'memoria', label: 'Memoria' },
  { value: 'sueno', label: 'Sueño' },
  { value: 'movilidad', label: 'Movilidad' },
  { value: 'dolor', label: 'Dolor' },
  { value: 'confusion', label: 'Confusión' },
  { value: 'ansiedad', label: 'Ansiedad' },
  { value: 'otro', label: 'Otro' },
] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function intensitySelectedClasses(level: number): string {
  if (level <= 3) return 'bg-success text-white';
  if (level <= 6) return 'bg-amber-500 text-white';
  return 'bg-error text-white';
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RegisterSymptomSheetProps {
  open: boolean;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (type: string, intensity: number, description?: string) => void;
  onClearError: () => void;
  mode?: 'create' | 'edit';
  initialValues?: { type: string; intensity: number; description?: string | null };
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RegisterSymptomSheet({
  open,
  isSaving,
  error,
  onClose,
  onSave,
  onClearError,
  mode = 'create',
  initialValues,
}: RegisterSymptomSheetProps) {
  const [type, setType] = useState('');
  const [intensity, setIntensity] = useState<number | null>(null);
  const [description, setDescription] = useState('');

  // Seed or reset state whenever the sheet opens (or the target row changes).
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialValues) {
        setType(initialValues.type);
        setIntensity(initialValues.intensity);
        setDescription(initialValues.description ?? '');
      } else {
        setType('');
        setIntensity(null);
        setDescription('');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialValues]);

  const handleClose = () => {
    setType('');
    setIntensity(null);
    setDescription('');
    onClose();
  };

  const handleSave = () => {
    if (!type || intensity === null) return;
    onSave(type, intensity, description.trim() || undefined);
  };

  const handleSelectType = (value: string) => {
    if (error) onClearError();
    setType(value);
  };

  const handleSelectIntensity = (n: number) => {
    if (error) onClearError();
    setIntensity(n);
  };

  const title = mode === 'edit' ? 'Editar síntoma' : 'Registrar síntoma';
  const saveLabel = isSaving
    ? 'Guardando...'
    : mode === 'edit'
    ? 'Guardar cambios'
    : 'Guardar';

  return (
    <Sheet open={open} onClose={handleClose} title={title}>
      <div className="space-y-5">
        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-error-light bg-error-light px-4 py-3"
          >
            <p className="text-sm font-medium text-error">{error}</p>
          </div>
        )}

        {/* Symptom type */}
        <div>
          <p className="mb-2 text-sm font-semibold text-brand-dark">Tipo de síntoma</p>
          <div className="grid grid-cols-3 gap-2">
            {SYMPTOM_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-pressed={type === t.value}
                onClick={() => handleSelectType(t.value)}
                className={cn(
                  'rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                  type === t.value
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white text-brand-dark border-gray-200 hover:border-brand-primary/50',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div>
          <p className="mb-2 text-sm font-semibold text-brand-dark">Intensidad (1-10)</p>
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={intensity === n}
                aria-label={`Intensidad ${n}`}
                onClick={() => handleSelectIntensity(n)}
                className={cn(
                  'h-10 rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                  intensity === n
                    ? intensitySelectedClasses(n)
                    : 'bg-gray-100 text-gray-text hover:bg-gray-200',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mt-4">
          <Textarea
            label="Descripción (opcional)"
            placeholder="Detalles adicionales sobre el síntoma..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 flex gap-3">
          <Button
            variant="ghost"
            size="md"
            fullWidth
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleSave}
            disabled={isSaving || !type || intensity === null}
          >
            {saveLabel}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
