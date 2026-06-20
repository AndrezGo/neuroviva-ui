'use client';
import { useState } from 'react';
import { Sheet } from '@/presentation/ui/Sheet';
import { Textarea } from '@/presentation/ui/Textarea';
import { Button } from '@/presentation/ui/Button';

interface LogIntakeSheetProps {
  open: boolean;
  medicationName: string;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
}

export function LogIntakeSheet({
  open,
  medicationName,
  isSubmitting,
  onClose,
  onConfirm,
}: LogIntakeSheetProps) {
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    setNotes('');
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <Sheet open={open} onClose={handleClose} title="Registrar toma">
      <p className="mb-4 text-sm text-gray-text">
        Medicamento:{' '}
        <span className="font-semibold text-brand-dark">{medicationName}</span>
      </p>
      <Textarea
        label="Observación (opcional)"
        placeholder="Ej. tomó con mucha agua, sin efectos adversos..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        maxLength={500}
      />
      <div className="mt-6 flex gap-3">
        <Button
          variant="ghost"
          size="md"
          fullWidth
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Confirmar toma'}
        </Button>
      </div>
    </Sheet>
  );
}
