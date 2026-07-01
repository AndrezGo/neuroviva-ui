'use client';

import { useState, useCallback } from 'react';
import { useCaregiverHistory } from '@/application/caregiver/useCaregiverHistory';
import { CaregiverHistoryScreen } from '@/presentation/caregiver/CaregiverHistoryScreen';
import { CaregiverShell } from '@/presentation/layout/CaregiverShell';

/**
 * Thin page: wires useCaregiverHistory to CaregiverHistoryScreen.
 * No business logic here.
 */
export default function CaregiverHistoriaPage() {
  const { events, isLoading, isError, error, reload, addNote, isSaving, saveError, resetError } =
    useCaregiverHistory();

  const [addNoteSheetOpen, setAddNoteSheetOpen] = useState(false);

  const onAddNote = useCallback(() => {
    setAddNoteSheetOpen(true);
  }, []);

  const onCloseAddNote = useCallback(() => {
    resetError();
    setAddNoteSheetOpen(false);
  }, [resetError]);

  const onSaveNote = useCallback(
    async (input: { eventType: string; description: string; eventDate?: string | null }) => {
      const ok = await addNote(input);
      if (ok) {
        setAddNoteSheetOpen(false);
        reload();
      }
    },
    [addNote, reload],
  );

  return (
    <CaregiverShell activeTab="history">
      <CaregiverHistoryScreen
        events={events}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onReload={reload}
        onAddNote={onAddNote}
        addNoteSheetOpen={addNoteSheetOpen}
        onCloseAddNote={onCloseAddNote}
        onSaveNote={onSaveNote}
        isSaving={isSaving}
        saveError={saveError}
        onClearSaveError={resetError}
      />
    </CaregiverShell>
  );
}
