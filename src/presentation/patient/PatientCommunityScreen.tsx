'use client';

import { useCommunityGroups } from '@/application/patient/useCommunityGroups';
import { CommunityGroupCard } from './CommunityGroupCard';
import { Button } from '@/presentation/ui/Button';
import { routes } from '@/core/routing/routes';

/**
 * Content screen for the patient Comunidad tab.
 * PatientShell (header + tab bar) is owned by the page — this component
 * renders only the scrollable inner content.
 *
 * On mount, fetching groups also triggers transparent auto-join for groups
 * matching the patient's condition (backend handles this automatically).
 */
export function PatientCommunityScreen() {
  const { groups, isLoading, isError, error, reload } = useCommunityGroups();

  return (
    <div className="flex flex-col gap-5 px-4 py-6">
      <h2 className="text-xl font-black tracking-tight text-brand-dark">Comunidad</h2>

      {/* Loading state */}
      {isLoading && (
        <div
          className="flex flex-col gap-3"
          aria-busy="true"
          aria-label="Cargando grupos de comunidad"
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 w-full animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          role="alert"
          className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center"
        >
          <p className="text-sm font-medium text-red-700">
            {error ?? 'Ocurrió un error al cargar los grupos.'}
          </p>
          <Button variant="primary" size="sm" onClick={reload}>
            Reintentar
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && groups.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-gray-text">
            Aún no hay un grupo para tu condición — vuelve pronto.
          </p>
        </div>
      )}

      {/* Group list */}
      {!isLoading && !isError && groups.length > 0 && (
        <ul
          className="flex flex-col gap-3"
          aria-label="Tus grupos de comunidad"
        >
          {groups.map((group) => (
            <li key={group.id}>
              <CommunityGroupCard
                group={group}
                href={routes.patientGroupFeed(group.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
