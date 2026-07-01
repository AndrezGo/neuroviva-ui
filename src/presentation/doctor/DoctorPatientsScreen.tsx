'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/cn';
import { formatRelativeTime } from '@/shared/lib/relativeTime';
import { DoctorTabBar } from './DoctorTabBar';
import type { DoctorPatient, AlertPriority } from '@/domain/doctor/doctor.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPriorityBadge(priority: AlertPriority | null): { classes: string; label: string } {
  switch (priority) {
    case 'critica':
      return { classes: 'bg-red-100 text-red-700', label: 'Alto' };
    case 'alta':
      return { classes: 'bg-orange-100 text-orange-700', label: 'Atención' };
    case 'media':
      return { classes: 'bg-yellow-100 text-yellow-700', label: 'Atención' };
    case 'info':
    case null:
    default:
      return { classes: 'bg-green-100 text-green-700', label: 'Estable' };
  }
}

// Deterministic gradient assigned from the first two char codes of the patient name
const AVATAR_GRADIENTS = [
  'from-pink-400 to-rose-500',
  'from-violet-400 to-purple-600',
  'from-blue-400 to-cyan-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-red-400 to-rose-600',
  'from-indigo-400 to-blue-600',
  'from-fuchsia-400 to-pink-600',
];

function getAvatarGradient(name: string): string {
  const charCode = (name.charCodeAt(0) || 0) + (name.charCodeAt(1) || 0);
  return AVATAR_GRADIENTS[charCode % AVATAR_GRADIENTS.length];
}

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DoctorPatientsScreenProps {
  patients: DoctorPatient[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  onReload: () => void;
  isScientificCommittee?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DoctorPatientsScreen({
  patients,
  isLoading,
  isError,
  error,
  onReload,
  isScientificCommittee = false,
}: DoctorPatientsScreenProps) {
  const [search, setSearch] = useState('');

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  // Stats computed from the full list (not the filtered subset)
  const totalActive = patients.length;
  const requireAttention = patients.filter(
    (p) => p.highestAlertPriority === 'alta' || p.highestAlertPriority === 'media',
  ).length;
  const highRisk = patients.filter(
    (p) => p.highestAlertPriority === 'critica',
  ).length;

  return (
    <div className="flex flex-1 flex-col pb-24 lg:pb-8">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-primary mb-1">
          Panel Clínico
        </p>
        <h1 className="text-2xl font-bold text-brand-dark">Mis Pacientes</h1>

        {/* Summary stat cards */}
        {!isLoading && !isError && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-3 py-3 text-center">
              <p className="text-2xl font-bold text-brand-dark">{totalActive}</p>
              <p className="text-[11px] text-gray-text leading-tight mt-0.5">Activos</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-3 py-3 text-center">
              <p className="text-2xl font-bold text-amber-500">{requireAttention}</p>
              <p className="text-[11px] text-gray-text leading-tight mt-0.5">Requieren atención</p>
            </div>
            <div className="rounded-2xl bg-white shadow-sm border border-gray-100 px-3 py-3 text-center">
              <p className="text-2xl font-bold text-red-500">{highRisk}</p>
              <p className="text-[11px] text-gray-text leading-tight mt-0.5">Riesgo alto</p>
            </div>
          </div>
        )}

        {/* Search input */}
        <div className="mt-4">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar paciente..."
            aria-label="Buscar paciente por nombre"
            className={cn(
              'w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5',
              'text-sm text-brand-dark placeholder:text-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-1',
              'transition-colors duration-150',
            )}
          />
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-5">
        {/* Loading skeleton */}
        {isLoading && (
          <div aria-busy="true" aria-label="Cargando pacientes" className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && isError && (
          <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-8 text-center"
          >
            <p className="text-sm font-medium text-red-700">
              {error ?? 'Error al cargar los pacientes.'}
            </p>
            <button
              type="button"
              onClick={onReload}
              className={cn(
                'rounded-xl bg-brand-primary px-5 py-2 text-sm font-semibold text-white',
                'transition-colors hover:opacity-90',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
              )}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && filteredPatients.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-gray-text">
              {search
                ? 'No se encontraron pacientes con ese nombre.'
                : 'Aún no tienes pacientes asignados. Aparecerán aquí cuando un cuidador te asigne.'}
            </p>
          </div>
        )}

        {/* Section label + Patient list */}
        {!isLoading && !isError && filteredPatients.length > 0 && (
          <>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              Seguimiento
            </p>
            <ul className="space-y-3">
              {filteredPatients.map((patient) => {
                const badge = getPriorityBadge(patient.highestAlertPriority);
                const gradient = getAvatarGradient(patient.name);
                const initial = getInitial(patient.name);
                const actRelative = patient.lastActivityAt
                  ? `act. ${formatRelativeTime(patient.lastActivityAt)}`
                  : null;

                return (
                  <li key={patient.patientId}>
                    <article className="flex items-center gap-3 rounded-2xl bg-white shadow-sm border border-gray-100 px-4 py-3.5">
                      {/* Avatar */}
                      <div
                        aria-hidden="true"
                        className={cn(
                          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br',
                          'text-white font-bold text-base select-none',
                          gradient,
                        )}
                      >
                        {initial}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-brand-dark truncate leading-snug">
                          {patient.name}
                        </p>
                        <p className="text-xs text-gray-text mt-0.5 truncate">
                          {patient.age} años
                          {patient.conditions.length > 0 ? ` · ${patient.conditions.join(', ')}` : ''}
                          {patient.conditionStage ? ` · ${patient.conditionStage}` : ''}
                        </p>
                        {actRelative && (
                          <p className="text-xs text-gray-400 mt-0.5">{actRelative}</p>
                        )}
                      </div>

                      {/* Badge */}
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold',
                          badge.classes,
                        )}
                      >
                        {badge.label}
                      </span>
                    </article>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* ── Mobile tab bar ──────────────────────────────────────── */}
      <DoctorTabBar activeTab="patients" isScientificCommittee={isScientificCommittee} />
    </div>
  );
}
