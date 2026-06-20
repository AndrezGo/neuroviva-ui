'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/shared/lib/cn';

interface CaregiverAccountMenuProps {
  firstName: string;
  email: string;
  onSignOut: () => void;
  isSigningOut?: boolean;
}

/**
 * Avatar button with a dropdown account menu for the desktop header.
 * Purely presentational — no store imports, no API calls.
 *
 * Accessibility:
 *   - aria-haspopup="menu" + aria-expanded on the trigger button
 *   - role="menu" on the dropdown, role="menuitem" on each action
 *   - Escape key closes the menu and returns focus to the trigger
 *   - Click outside closes the menu
 */
export function CaregiverAccountMenu({
  firstName,
  email,
  onSignOut,
  isSigningOut = false,
}: CaregiverAccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = 'caregiver-account-menu';

  const initial = firstName ? firstName.charAt(0).toUpperCase() : 'U';

  const openMenu = () => {
    setIsOpen(true);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // Close on Escape and focus management
  useEffect(() => {
    if (!isOpen) return;

    // Move focus into the menu when it opens
    const firstItem = menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]');
    firstItem?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative">
      {/* ── Trigger ──────────────────────────────────────────── */}
      <button
        ref={triggerRef}
        type="button"
        id={`${menuId}-trigger`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={handleToggle}
        className={cn(
          'flex items-center gap-2.5 rounded-full px-1 py-1',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2',
          isOpen && 'bg-gray-100',
        )}
      >
        {firstName && (
          <span className="hidden text-sm font-medium text-gray-text sm:block">
            {firstName}
          </span>
        )}
        {/* Avatar circle */}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            'bg-brand-primary text-xs font-bold text-white',
          )}
          aria-hidden="true"
        >
          {initial}
        </div>
      </button>

      {/* ── Dropdown ─────────────────────────────────────────── */}
      {isOpen && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-64',
            'rounded-2xl border border-gray-100 bg-white shadow-lg',
            'animate-fade-in',
          )}
        >
          {/* Header — user info */}
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-brand-dark">{firstName}</p>
            <p className="truncate text-xs text-gray-text">{email}</p>
          </div>

          {/* Menu items */}
          <div className="py-2">
            <button
              type="button"
              role="menuitem"
              disabled={isSigningOut}
              onClick={() => {
                closeMenu();
                onSignOut();
              }}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-2.5',
                'text-sm font-medium text-gray-text',
                'transition-colors duration-150',
                'hover:bg-gray-50 hover:text-brand-dark',
                'focus-visible:outline-none focus-visible:bg-gray-50',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {isSigningOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
