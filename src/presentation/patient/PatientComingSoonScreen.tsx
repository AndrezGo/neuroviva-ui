'use client';

interface PatientComingSoonScreenProps {
  title: string;
}

/**
 * Reusable stub screen for patient tab routes not yet implemented.
 * The shell (PatientShell) owns the tab bar — this component renders
 * only the centered placeholder content.
 */
export function PatientComingSoonScreen({ title }: PatientComingSoonScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      <p className="text-xl font-bold text-brand-dark">{title}</p>
      <p className="text-sm text-gray-text">Próximamente</p>
    </div>
  );
}
