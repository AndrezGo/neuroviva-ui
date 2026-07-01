'use client';

import { Sheet } from '@/presentation/ui/Sheet';
import type { DoctorListItem } from '@/domain/doctor/doctor.types';

// ── Avatar gradient helper ────────────────────────────────────────────────────

const GRADIENTS = [
  'from-violet-400 to-purple-600',
  'from-blue-400 to-indigo-600',
  'from-teal-400 to-cyan-600',
  'from-emerald-400 to-green-600',
  'from-orange-400 to-amber-600',
  'from-rose-400 to-pink-600',
  'from-sky-400 to-blue-600',
  'from-fuchsia-400 to-violet-600',
];

/**
 * Deterministic gradient based on a simple sum of char codes modulo the
 * gradient array length — gives a stable colour per doctor name.
 */
function getAvatarGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash += seed.charCodeAt(i);
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface AssignDoctorSheetProps {
  open: boolean;
  onClose: () => void;
  doctors: DoctorListItem[];
  currentDoctorId: string | null;
  isLoading?: boolean;
  isAssigning: boolean;
  onSelect: (doctorId: string) => void;
}

// ── Skeleton row ──────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 px-4 py-4">
      <div className="h-11 w-11 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-3.5 w-32 animate-pulse rounded-full bg-gray-200" />
        <div className="h-3 w-48 animate-pulse rounded-full bg-gray-100" />
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function AssignDoctorSheet({
  open,
  onClose,
  doctors,
  currentDoctorId,
  isLoading = false,
  isAssigning,
  onSelect,
}: AssignDoctorSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title="Seleccionar médico">
      <div className="flex flex-col gap-3 pb-2">
        {/* Loading skeleton */}
        {isLoading && (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        )}

        {/* Empty state */}
        {!isLoading && doctors.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="text-sm font-medium text-gray-text">No hay médicos disponibles</p>
          </div>
        )}

        {/* Doctor list */}
        {!isLoading &&
          doctors.map((doctor) => {
            const isCurrentDoctor = doctor.doctorId === currentDoctorId;
            const gradient = getAvatarGradient(doctor.name);
            const initial = doctor.name.charAt(0).toUpperCase();

            const subtitleParts: string[] = [];
            if (doctor.specialty) subtitleParts.push(doctor.specialty);
            if (doctor.medicalLicense) subtitleParts.push(`Cédula: ${doctor.medicalLicense}`);
            const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' · ') : 'Sin especialidad';

            return (
              <button
                key={doctor.doctorId}
                type="button"
                disabled={isAssigning}
                aria-label={`Seleccionar al Dr. ${doctor.name}${isCurrentDoctor ? ' (asignado actualmente)' : ''}`}
                onClick={() => onSelect(doctor.doctorId)}
                className={[
                  'flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
                  isCurrentDoctor
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-brand-primary/30 hover:bg-brand-primary-light',
                  isAssigning ? 'cursor-not-allowed opacity-60' : '',
                ].join(' ')}
              >
                {/* Avatar */}
                <div
                  aria-hidden="true"
                  className={`h-11 w-11 flex-shrink-0 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-base`}
                >
                  {initial}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-bold text-brand-dark truncate">{doctor.name}</span>
                  <span className="text-xs text-gray-text truncate">{subtitle}</span>
                </div>

                {/* Badge */}
                {isCurrentDoctor && (
                  <span className="flex-shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                    Asignado actualmente
                  </span>
                )}
              </button>
            );
          })}
      </div>
    </Sheet>
  );
}
