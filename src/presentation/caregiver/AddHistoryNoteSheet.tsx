'use client';

import { useState } from 'react';
import { Sheet } from '@/presentation/ui/Sheet';
import { Button } from '@/presentation/ui/Button';
import { Textarea } from '@/presentation/ui/Textarea';
import { TextField } from '@/presentation/ui/TextField';
import { cn } from '@/shared/lib/cn';

// ── Constants ─────────────────────────────────────────────────────────────────

const HISTORY_NOTE_TYPES = [
  { value: 'consultation', label: 'Consulta' },
  { value: 'exam', label: 'Examen' },
  { value: 'note', label: 'Nota' },
  { value: 'other', label: 'Otro' },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface AddHistoryNoteSheetProps {
  open: boolean;
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onSave: (input: { eventType: string; description: string; eventDate?: string | null }) => void;
  onClearError: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AddHistoryNoteSheet({
  open,
  isSaving,
  error,
  onClose,
  onSave,
  onClearError,
}: AddHistoryNoteSheetProps) {
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');

  const handleClose = () => {
    setEventType('');
    setDescription('');
    setEventDate('');
    onClose();
  };

  const handleSave = () => {
    if (!eventType || !description.trim()) return;
    onSave({
      eventType,
      description: description.trim(),
      eventDate: eventDate ? new Date(eventDate).toISOString() : null,
    });
  };

  const handleSelectType = (value: string) => {
    if (error) onClearError();
    setEventType(value);
  };

  const handleChangeDescription = (value: string) => {
    if (error) onClearError();
    setDescription(value);
  };

  return (
    <Sheet open={open} onClose={handleClose} title="Agregar nota">
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

        {/* Event type */}
        <div>
          <p className="mb-2 text-sm font-semibold text-brand-dark">Tipo de registro</p>
          <div className="grid grid-cols-2 gap-2">
            {HISTORY_NOTE_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                aria-pressed={eventType === t.value}
                onClick={() => handleSelectType(t.value)}
                className={cn(
                  'rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
                  eventType === t.value
                    ? 'bg-brand-primary text-white border-brand-primary'
                    : 'bg-white text-brand-dark border-gray-200 hover:border-brand-primary/50',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <Textarea
            label="Descripción"
            placeholder="Ej: El doctor ajustó la dosis del medicamento..."
            value={description}
            onChange={(e) => handleChangeDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Optional date */}
        <div>
          <TextField
            type="datetime-local"
            label="Fecha y hora (opcional)"
            helperText="Si la dejas vacía se usará la fecha y hora actual."
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
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
            disabled={isSaving || !eventType || !description.trim()}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
