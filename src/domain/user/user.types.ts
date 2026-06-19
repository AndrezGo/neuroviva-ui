/**
 * Domain types for the backend user entity.
 * No framework imports allowed here.
 */

/**
 * Role values as the backend API expects them (Spanish strings).
 * These are the wire values sent to / received from the .NET API.
 */
export type BackendRoleName = 'paciente' | 'cuidador' | 'medico';

/**
 * Shape returned by /api/v1/users/sync, /api/v1/users/me and /api/v1/users/me/role.
 */
export interface BackendUser {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  isActive: boolean;
  /** Contains backend role names, e.g. ["cuidador"]. Empty array means no role assigned yet. */
  roles: BackendRoleName[];
  createdAt: string;
}
