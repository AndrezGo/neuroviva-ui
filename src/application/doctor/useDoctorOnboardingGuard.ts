'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseAuthRepository } from '@/infrastructure/auth/supabaseAuth.repository';
import { getMyDoctorProfile } from '@/infrastructure/api/doctorApi.repository';
import { routes } from '@/core/routing/routes';

export interface UseDoctorOnboardingGuardReturn {
  /** True while the profile check is in flight — render a spinner. */
  isChecking: boolean;
}

/**
 * Guards the doctor home page.
 * - Redirects to login if there is no active session.
 * - Redirects to the doctor onboarding flow if the doctor profile does not
 *   exist yet (API returns 404).
 * - Sets `isChecking` to false once the check completes so the page can render.
 */
export function useDoctorOnboardingGuard(): UseDoctorOnboardingGuardReturn {
  const [isChecking, setIsChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const token = await supabaseAuthRepository.getAccessToken();

        if (!token) {
          if (active) router.replace(routes.login());
          return;
        }

        const profile = await getMyDoctorProfile(token);

        if (!profile && active) {
          router.replace(routes.onboardingDoctor());
        }
      } finally {
        if (active) setIsChecking(false);
      }
    }

    check();

    return () => {
      active = false;
    };
  }, [router]);

  return { isChecking };
}
