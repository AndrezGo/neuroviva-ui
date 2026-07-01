'use client';

import { useId, useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/shared/lib/cn';
import { MONTHS_ES, parseISODate, toISODate, daysInMonth } from '@/shared/lib/date';

interface BirthDateSelectProps {
  /** ISO "YYYY-MM-DD" string or null when no date is selected. */
  value: string | null;
  /** Called with an ISO string when all three parts are chosen, or null otherwise. */
  onChange: (iso: string | null) => void;
  /** 'dark' matches the onboarding dark background; 'light' matches light form controls. */
  variant?: 'dark' | 'light';
  /** Label text displayed above the selects. */
  label?: string;
  /** When true, appends "(opcional)" to the label. */
  optional?: boolean;
  /** Disables all three selects. */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Style constants
// ---------------------------------------------------------------------------

const DARK_SELECT_CLASS =
  'w-full rounded-2xl border border-white/15 bg-white/10 px-3 py-3.5 text-base text-white ' +
  'appearance-none transition-all duration-200 ' +
  'hover:border-brand-primary/50 ' +
  'focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/30 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-brand-dark ' +
  'disabled:cursor-not-allowed disabled:opacity-60 ' +
  '[&>option]:bg-brand-dark [&>option]:text-white';

const LIGHT_SELECT_CLASS =
  'w-full rounded-2xl border border-gray-200 bg-white px-3 py-3.5 text-base text-brand-dark ' +
  'appearance-none transition-all duration-200 ' +
  'hover:border-brand-primary/50 ' +
  'focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary ' +
  'focus-visible:ring-offset-1 ' +
  'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60';

const LABEL_DARK_CLASS = 'text-sm font-semibold text-gray-300 tracking-tight';
const LABEL_LIGHT_CLASS = 'text-sm font-semibold text-brand-dark tracking-tight';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Purely presentational three-select date-of-birth picker (Day / Month / Year).
 * Emits ISO "YYYY-MM-DD" via onChange when all three parts are selected,
 * or null when any part is missing.
 */
export function BirthDateSelect({
  value,
  onChange,
  variant = 'light',
  label,
  optional = false,
  disabled = false,
}: BirthDateSelectProps) {
  const labelId = useId();
  const dayId = useId();
  const monthId = useId();
  const yearId = useId();

  // Derive initial partial state from the incoming value.
  const parsed = parseISODate(value);

  const [selectedDay, setSelectedDay] = useState<number | null>(parsed?.day ?? null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(parsed?.month ?? null);
  const [selectedYear, setSelectedYear] = useState<number | null>(parsed?.year ?? null);

  // Re-sync local state when `value` changes externally (e.g. parent resets it).
  useEffect(() => {
    const p = parseISODate(value);
    setSelectedDay(p?.day ?? null);
    setSelectedMonth(p?.month ?? null);
    setSelectedYear(p?.year ?? null);
  }, [value]);

  // Current year for building the year list.
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Build year options: current year down to currentYear - 120.
  const yearOptions = useMemo<number[]>(() => {
    const years: number[] = [];
    for (let y = currentYear; y >= currentYear - 120; y--) {
      years.push(y);
    }
    return years;
  }, [currentYear]);

  // Build day options based on selected month/year (clamped to max valid day).
  const maxDay = useMemo<number>(() => {
    if (selectedMonth && selectedYear) {
      return daysInMonth(selectedYear, selectedMonth);
    }
    // Without a full month+year, show 31 as the upper bound.
    return 31;
  }, [selectedMonth, selectedYear]);

  const dayOptions = useMemo<number[]>(() => {
    const days: number[] = [];
    for (let d = 1; d <= maxDay; d++) {
      days.push(d);
    }
    return days;
  }, [maxDay]);

  /**
   * Emit ISO string (or null) whenever any of the three parts changes.
   * Clamps day if it now exceeds the valid range for the chosen month/year.
   */
  const emitChange = useCallback(
    (day: number | null, month: number | null, year: number | null) => {
      // Clamp day if needed.
      let clampedDay = day;
      if (clampedDay !== null && month !== null && year !== null) {
        const max = daysInMonth(year, month);
        if (clampedDay > max) clampedDay = max;
      }

      if (clampedDay !== null && month !== null && year !== null) {
        onChange(toISODate(year, month, clampedDay));
      } else {
        onChange(null);
      }

      // Update clamped day in local state if it changed.
      if (clampedDay !== day) {
        setSelectedDay(clampedDay);
      }
    },
    [onChange],
  );

  const handleDayChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const day = e.target.value === '' ? null : parseInt(e.target.value, 10);
      setSelectedDay(day);
      emitChange(day, selectedMonth, selectedYear);
    },
    [emitChange, selectedMonth, selectedYear],
  );

  const handleMonthChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const month = e.target.value === '' ? null : parseInt(e.target.value, 10);
      setSelectedMonth(month);
      emitChange(selectedDay, month, selectedYear);
    },
    [emitChange, selectedDay, selectedYear],
  );

  const handleYearChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const year = e.target.value === '' ? null : parseInt(e.target.value, 10);
      setSelectedYear(year);
      emitChange(selectedDay, selectedMonth, year);
    },
    [emitChange, selectedDay, selectedMonth],
  );

  const selectClass = variant === 'dark' ? DARK_SELECT_CLASS : LIGHT_SELECT_CLASS;
  const labelClass = variant === 'dark' ? LABEL_DARK_CLASS : LABEL_LIGHT_CLASS;
  const optionalClass = variant === 'dark' ? 'font-normal text-gray-400' : 'font-normal text-gray-text';

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <span id={labelId} className={labelClass}>
          {label}
          {optional && (
            <span className={cn('ml-1', optionalClass)}>(opcional)</span>
          )}
        </span>
      )}

      <div className="grid grid-cols-3 gap-2" role="group" aria-labelledby={label ? labelId : undefined}>
        {/* Day */}
        <div className="flex flex-col gap-1">
          <label htmlFor={dayId} className="sr-only">
            Día
          </label>
          <select
            id={dayId}
            aria-label="Día de nacimiento"
            value={selectedDay ?? ''}
            onChange={handleDayChange}
            disabled={disabled}
            className={selectClass}
          >
            <option value="">Día</option>
            {dayOptions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Month */}
        <div className="flex flex-col gap-1">
          <label htmlFor={monthId} className="sr-only">
            Mes
          </label>
          <select
            id={monthId}
            aria-label="Mes de nacimiento"
            value={selectedMonth ?? ''}
            onChange={handleMonthChange}
            disabled={disabled}
            className={selectClass}
          >
            <option value="">Mes</option>
            {MONTHS_ES.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="flex flex-col gap-1">
          <label htmlFor={yearId} className="sr-only">
            Año
          </label>
          <select
            id={yearId}
            aria-label="Año de nacimiento"
            value={selectedYear ?? ''}
            onChange={handleYearChange}
            disabled={disabled}
            className={selectClass}
          >
            <option value="">Año</option>
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
