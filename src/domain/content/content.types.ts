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
  /** Channel this video belongs to, populated only when type is Video. */
  channelId: string | null;
  /** Display name of the channel, populated only when type is Video. */
  channelName: string | null;
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
  /** Channel this video belongs to, populated only when type is Video. */
  channelId: string | null;
  /** Display name of the channel, populated only when type is Video. */
  channelName: string | null;
}

/** Body sent to POST /api/v1/curator/resources */
export interface CreateResourceInput {
  title: string;
  /** Snake-case value sent to the backend (asymmetric with the response type field). */
  type: ResourceRequestType;
  url?: string | null;
  description?: string | null;
  diseaseId?: string | null;
  /** Only valid when type === 'video'. Assigns the resource to a channel. */
  channelId?: string | null;
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

/** DTO returned by GET /api/v1/curator/channels */
export interface Channel {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  createdAt: string;
}

/** Body sent to POST /api/v1/curator/channels */
export interface CreateChannelInput {
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
}

/** Response body from POST /api/v1/curator/channels */
export interface CreateChannelResult {
  channelId: string;
}

/** Body sent to PATCH /api/v1/curator/channels/{id} — full replacement of the channel. */
export interface UpdateChannelInput {
  name: string;
  description?: string | null;
  avatarUrl?: string | null;
}

/** Body sent to PATCH /api/v1/curator/resources/{id} — full replacement. Same validations as create. */
export interface UpdateResourceInput {
  title: string;
  /** Snake-case value sent to the backend (asymmetric with the response type field). */
  type: ResourceRequestType;
  url?: string | null;
  description?: string | null;
  diseaseId?: string | null;
  /** Only valid when type === 'video'. Assigns the resource to a channel. */
  channelId?: string | null;
}

/**
 * DTO returned by GET /api/v1/curator/resources.
 * Identical to PendingResource plus approvalStatus.
 *
 * NOTE: the `type` field arrives as PascalCase from the C# backend
 * ("News" | "ScientificArticle" | "Video"). When sending to PATCH, convert it
 * back to snake_case (ResourceRequestType) using toRequestType().
 */
export interface AllResourceItem {
  id: string;
  authorId: string;
  diseaseId: string | null;
  title: string;
  /**
   * PascalCase C# enum string from the backend: "News" | "ScientificArticle" | "Video".
   * Must be mapped to snake_case ResourceRequestType before sending to PATCH.
   */
  type: string;
  url: string | null;
  description: string | null;
  createdAt: string;
  /** Channel this resource belongs to, populated only when type is Video. */
  channelId: string | null;
  /** Display name of the channel, populated only when type is Video. */
  channelName: string | null;
  /** Approval workflow status: "pendiente" | "aprobado" | "rechazado". */
  approvalStatus: string;
}
