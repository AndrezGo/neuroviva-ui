/**
 * Domain types for the Community feature (guided forum for patients).
 * Pure TypeScript — no imports from other layers.
 *
 * Design notes:
 * - `reactions` on CommunityPost is an aggregate count map keyed by reaction type
 *   (e.g. { "apoyo": 3 }). Missing keys mean zero reactions of that type.
 * - `myReactions` on CommunityPost lists the reaction types the current user has
 *   already submitted, as reported by the server on each feed load.
 * - Comments are listable via GET /api/v1/patient/community/posts/{postId}/comments.
 *   See CommunityComment below and getPostComments in communityApi.repository.ts.
 * - When `removed === true` on a post or comment, the backend has already replaced
 *   `content` with "[Contenido retirado por moderación]" — the UI must render
 *   ModerationBadge instead and must NOT attempt further content masking.
 */

export type ReactionType = 'apoyo' | 'animo' | 'gracias' | 'me_identifico' | 'fuerza';

/** All valid reaction types in display order. */
export const REACTION_TYPES: readonly ReactionType[] = [
  'apoyo',
  'animo',
  'gracias',
  'me_identifico',
  'fuerza',
] as const;

/** Spanish display labels for each reaction type shown to the patient. */
export const REACTION_LABELS: Readonly<Record<ReactionType, string>> = {
  apoyo: 'Apoyo',
  animo: 'Ánimo',
  gracias: 'Gracias',
  me_identifico: 'Me identifico',
  fuerza: 'Fuerza',
} as const;

/**
 * DTO returned by GET /api/v1/patient/community/groups.
 * Calling this endpoint also triggers transparent auto-join on the backend
 * (no separate join endpoint exists).
 */
export interface CommunityGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  diseaseId: string | null;
  joinedAt: string;
}

/**
 * DTO returned by GET /api/v1/patient/community/groups/{groupId}/feed.
 *
 * When `removed === true`, the backend has already replaced `content` with
 * "[Contenido retirado por moderación]" — UI should render ModerationBadge instead.
 *
 * `reactions` is an aggregate count map keyed by reaction type (e.g. { "apoyo": 3 }).
 * Missing keys mean zero reactions of that type.
 *
 * `myReactions` lists the reaction types the current user has already submitted on
 * this post, as reported by the server. This seeds the local selected-state on load;
 * optimistic toggles are layered on top in useGroupFeed and persist across reload
 * because they are re-derived from fresh server data.
 *
 * `commentCount` is the total number of comments on this post (including moderated
 * ones). The full thread is loaded lazily via GET .../comments — see CommunityComment.
 */
export interface CommunityPost {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  removed: boolean;
  removedReason: string | null;
  reactions: Record<string, number>;
  myReactions: string[];
  commentCount: number;
}

/**
 * DTO returned by GET /api/v1/patient/community/posts/{postId}/comments.
 * Comments are ordered chronologically ascending (oldest first).
 *
 * When `removed === true`, the backend has already replaced `content` with
 * "[Contenido retirado por moderación]" — UI should render ModerationBadge instead.
 */
export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  removed: boolean;
  removedReason: string | null;
}

/** Body for POST /api/v1/patient/community/groups/{groupId}/posts */
export interface CreatePostInput {
  content: string;
  visibility?: string;
}

/** Response from POST /api/v1/patient/community/groups/{groupId}/posts */
export interface CreatePostResult {
  postId: string;
}

/** Body for POST /api/v1/patient/community/posts/{postId}/comments */
export interface CreateCommentInput {
  content: string;
}

/** Response from POST /api/v1/patient/community/posts/{postId}/comments */
export interface CreateCommentResult {
  commentId: string;
}

/** Response from POST /api/v1/patient/community/posts/{postId}/reactions */
export interface AddReactionResult {
  reactionId: string;
}
