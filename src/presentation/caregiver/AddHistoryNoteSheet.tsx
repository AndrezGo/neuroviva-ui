'use client';

import { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
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
  onSave: (input: { eventType: string; description: string; eventDate?: string | null; attachment?: File | null }) => void;
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
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setEventType('');
    setDescription('');
    setEventDate('');
    setFile(null);
    onClose();
  };

  const handleSave = () => {
    if (!eventType || !description.trim()) return;
    onSave({
      eventType,
      description: description.trim(),
      eventDate: eventDate ? new Date(eventDate).toISOString() : null,
      attachment: file || null,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) onClearError();
    setFile(e.target.files?.[0] ?? null);
    // Reset the input value so the same file can be re-selected after clearing
    e.target.value = '';
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

        {/* File attachment */}
        <div>
          <p className="mb-2 text-sm font-semibold text-brand-dark">
            Adjuntar imagen o archivo (opcional)
          </p>

          {/* Hidden native file input */}
          <input
            ref={fileInputRef}
            id="history-note-attachment"
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={handleFileChange}
            tabIndex={-1}
            aria-hidden="true"
          />

          {file ? (
            /* File selected — show filename + clear button */
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3.5">
              <Paperclip className="h-4 w-4 shrink-0 text-brand-primary" aria-hidden="true" />
              <span className="flex-1 truncate text-sm text-brand-dark">{file.name}</span>
              <button
                type="button"
                aria-label="Quitar archivo"
                onClick={handleClearFile}
                className="shrink-0 rounded-lg p-0.5 text-gray-text hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            /* No file selected — styled trigger label */
            <label
              htmlFor="history-note-attachment"
              className="flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 transition-colors hover:border-brand-primary/50 focus-within:ring-2 focus-within:ring-brand-primary"
            >
              <Paperclip className="h-4 w-4 shrink-0 text-gray-text" aria-hidden="true" />
              <span className="text-sm text-gray-text">Seleccionar archivo…</span>
            </label>
          )}

          <p className="mt-1.5 text-xs text-gray-text">
            Formatos: JPG, PNG, WEBP o PDF. Máximo 10MB.
          </p>
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
