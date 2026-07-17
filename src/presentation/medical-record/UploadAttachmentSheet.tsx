'use client';

import { useRef, useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { Sheet } from '@/presentation/ui/Sheet';
import { Button } from '@/presentation/ui/Button';
import { Textarea } from '@/presentation/ui/Textarea';
import { TextField } from '@/presentation/ui/TextField';
import { cn } from '@/shared/lib/cn';

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 5;

const CLINICAL_NOTE_TYPES = [
  { value: 'consultation', label: 'Nota de consulta' },
  { value: 'note', label: 'Nota' },
  { value: 'other', label: 'Otro' },
] as const;

// ── Props ─────────────────────────────────────────────────────────────────────

interface UploadAttachmentSheetProps {
  open: boolean;
  kind: 'exam' | 'clinical-note';
  isSaving: boolean;
  error: string | null;
  onClose: () => void;
  onClearError: () => void;
  onSave: (input: {
    eventType: string | null;
    description: string;
    eventDate: string | null;
    attachments: File[];
  }) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function UploadAttachmentSheet({
  open,
  kind,
  isSaving,
  error,
  onClose,
  onClearError,
  onSave,
}: UploadAttachmentSheetProps) {
  const [eventType, setEventType] = useState('');
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [validationMessage, setValidationMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    setEventType('');
    setDescription('');
    setEventDate('');
    setAttachments([]);
    setValidationMessage('');
    onClose();
  };

  const handleSave = () => {
    if (!description.trim()) return;
    if (kind === 'clinical-note' && !eventType) return;

    onSave({
      eventType: kind === 'clinical-note' ? eventType : null,
      description: description.trim(),
      eventDate: eventDate ? new Date(eventDate).toISOString() : null,
      attachments,
    });
  };

  const handleSelectType = (value: string) => {
    if (error) onClearError();
    setEventType(value);
  };

  const handleChangeDescription = (value: string) => {
    if (error) onClearError();
    setValidationMessage('');
    setDescription(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files ?? []);
    // Always reset so the same file can be re-picked after removing it
    e.target.value = '';

    if (newFiles.length === 0) return;

    // Reject any file exceeding the size limit
    const oversized = newFiles.filter((f) => f.size > MAX_FILE_BYTES);
    if (oversized.length > 0) {
      setValidationMessage(
        `El archivo "${oversized[0].name}" supera el límite de 10 MB por archivo.`,
      );
      return;
    }

    // Reject additions that would exceed the total file count
    if (attachments.length + newFiles.length > MAX_FILES) {
      setValidationMessage(
        `Solo puedes adjuntar hasta ${MAX_FILES} archivos en total.`,
      );
      return;
    }

    setValidationMessage('');
    if (error) onClearError();

    // Accumulate — dedupe by name + size (nice-to-have)
    setAttachments((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}:${f.size}`));
      const deduped = newFiles.filter((f) => !existing.has(`${f.name}:${f.size}`));
      return [...prev, ...deduped];
    });
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setValidationMessage('');
  };

  const title = kind === 'exam' ? 'Subir examen' : 'Agregar nota clínica';

  const isSaveDisabled =
    isSaving ||
    !description.trim() ||
    (kind === 'clinical-note' && !eventType);

  return (
    <Sheet open={open} onClose={handleClose} title={title}>
      <div className="space-y-5">
        {/* API error banner */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-error-light bg-error-light px-4 py-3"
          >
            <p className="text-sm font-medium text-error">{error}</p>
          </div>
        )}

        {/* Event type selector — clinical-note only */}
        {kind === 'clinical-note' && (
          <div>
            <p className="mb-2 text-sm font-semibold text-brand-dark">Tipo de nota</p>
            <div className="grid grid-cols-2 gap-2">
              {CLINICAL_NOTE_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  aria-pressed={eventType === t.value}
                  onClick={() => handleSelectType(t.value)}
                  className={cn(
                    'rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary',
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
        )}

        {/* Description */}
        <div>
          <Textarea
            label="Descripción"
            placeholder="Escribe una descripción..."
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
            onChange={(e) => {
              if (error) onClearError();
              setEventDate(e.target.value);
            }}
          />
        </div>

        {/* File attachment */}
        <div>
          <p className="mb-2 text-sm font-semibold text-brand-dark">
            Adjuntar archivos (opcional)
          </p>

          {/* Hidden native file input */}
          <input
            ref={fileInputRef}
            id="upload-attachment-input"
            type="file"
            multiple
            accept="image/*,.pdf"
            className="sr-only"
            onChange={handleFileChange}
            tabIndex={-1}
            aria-hidden="true"
          />

          {/* Styled trigger label */}
          <label
            htmlFor="upload-attachment-input"
            className="flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 transition-colors hover:border-brand-primary/50 focus-within:ring-2 focus-within:ring-brand-primary"
          >
            <Paperclip className="h-4 w-4 shrink-0 text-gray-text" aria-hidden="true" />
            <span className="text-sm text-gray-text">Seleccionar archivos…</span>
          </label>

          {/* Validation message */}
          {validationMessage && (
            <p className="mt-1.5 text-xs font-medium text-error" role="alert">
              {validationMessage}
            </p>
          )}

          {/* Helper text */}
          <p className="mt-1.5 text-xs text-gray-text">
            Formatos: JPG, PNG, WEBP o PDF. Máximo 10MB por archivo, hasta 5 archivos.
          </p>

          {/* Selected files list */}
          {attachments.length > 0 && (
            <ul className="mt-3 space-y-2">
              {attachments.map((file, index) => (
                <li
                  key={`${file.name}:${file.size}:${index}`}
                  className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3.5"
                >
                  <Paperclip
                    className="h-4 w-4 shrink-0 text-brand-primary"
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate text-sm text-brand-dark">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    aria-label="Quitar archivo"
                    onClick={() => handleRemoveFile(index)}
                    className="shrink-0 rounded-lg p-0.5 text-gray-text hover:text-error focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
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
            disabled={isSaveDisabled}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
