/**
 * Domain types for the Content feature (patient resources + curator).
 * Pure TypeScript — no imports from other layers.
 */

/**
 * Snake-case values sent to the backend in request query params and body.
 * ASYMMETRIC: the backend responds with PascalCase C# enum names (see PatientResource.type).
 */
export type ResourceRequestType = 'news' | 'scientific_article' | 'video';

/** DTO returned by GET /api/v1/patient/resources */
export interface PatientResource {
  id: string;
  title: string;
  /**
   * PascalCase C# enum string from the backend: "News" | "ScientificArticle" | "Video".
   * When consuming this field for display, map defensively handling BOTH casings.
   */
  type: string;
  url: string | null;
  description: string | null;
  createdAt: string;
  /** Ready-to-use YouTube embed URL — populated only when type is Video. */
  embedUrl: string | null;
}

/** DTO returned by GET /api/v1/curator/resources/pending */
export interface PendingResource {
  id: string;
  authorId: string;
  diseaseId: string | null;
  title: string;
  /**
   * PascalCase C# enum string from the backend: "News" | "ScientificArticle" | "Video".
   * When consuming this field for display, map defensively handling BOTH casings.
   */
  type: string;
  url: string | null;
  description: string | null;
  createdAt: string;
}

/** Body sent to POST /api/v1/curator/resources */
export interface CreateResourceInput {
  title: string;
  /** Snake-case value sent to the backend (asymmetric with the response type field). */
  type: ResourceRequestType;
  url?: string | null;
  description?: string | null;
  diseaseId?: string | null;
}

/** Response body from POST /api/v1/curator/resources */
export interface CreateResourceResult {
  resourceId: string;
}

/** DTO returned by GET /api/v1/curator/diseases */
export interface Disease {
  id: string;
  name: string;
  slug: string;
  category: string | null;
}
