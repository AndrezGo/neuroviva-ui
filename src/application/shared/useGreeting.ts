'use client';

import { useState, useEffect } from 'react';
import { getGreeting } from '@/shared/lib/greeting';

/**
 * SSR-safe hook that returns a time-appropriate Spanish greeting.
 *
 * WHY: `getGreeting()` reads `new Date().getHours()`, which produces a
 * time-dependent string. When called directly inside a 'use client' component
 * body, the server-rendered HTML and the client's first synchronous render may
 * return different strings (e.g., server renders at 11:59 "Buenos días" but
 * the client hydrates at 12:00 "Buenas tardes"), causing React hydration
 * mismatch error #418.
 *
 * FIX: Seed `useState` with the deterministic, time-agnostic value `'Hola'`
 * so the server HTML and the client's first synchronous render are
 * byte-identical. A `useEffect` then upgrades to the real time-based greeting
 * only on the client, after mount — well after React reconciliation is
 * complete, so no hydration mismatch can occur.
 *
 * The underlying `getGreeting` util remains a pure, unit-testable function
 * with no framework dependencies. This hook is the only place that bridges
 * it into the React lifecycle.
 */
export function useGreeting(): string {
  const [greeting, setGreeting] = useState<string>('Hola');

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  return greeting;
}
