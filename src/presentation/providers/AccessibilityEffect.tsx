'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '@/shared/store/usePreferencesStore';

/**
 * Headless client island — mounts once in the root layout.
 * Subscribes to persisted accessibility preferences and reflects
 * them as data-attributes on <html> so CSS selectors apply globally.
 * Renders null; zero DOM output.
 */
export function AccessibilityEffect() {
  const largeText = usePreferencesStore((s) => s.largeText);
  const highContrast = usePreferencesStore((s) => s.highContrast);

  useEffect(() => {
    const root = document.documentElement;

    if (largeText) {
      root.setAttribute('data-large-text', 'true');
    } else {
      root.removeAttribute('data-large-text');
    }

    if (highContrast) {
      root.setAttribute('data-high-contrast', 'true');
    } else {
      root.removeAttribute('data-high-contrast');
    }
  }, [largeText, highContrast]);

  return null;
}
