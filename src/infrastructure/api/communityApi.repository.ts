'use client';

import { apiRequest } from './apiClient';
import type {
  CommunityGroup,
  CommunityPost,
  CommunityComment,
  CreatePostInput,
  CreatePostResult,
  CreateCommentInput,
  CreateCommentResult,
  AddReactionResult,
  ReactionType,
} from '@/domain/community/community.types';

/**
 * Fetches the list of community groups the patient belongs to.
 *
 * IMPORTANT: Calling this endpoint also triggers transparent auto-join on the backend
 * for groups matching the patient's condition — there is no separate join endpoint.
 */
export async function getMyGroups(token: string): Promise<CommunityGroup[]> {
  return apiRequest<CommunityGroup[]>('/api/v1/patient/community/groups', {
    method: 'GET',
    token,
  });
}

/**
 * Fetches a paginated feed of posts for a specific community group.
 * Posts are returned in descending creation order (newest first).
 */
export async function getGroupFeed(
  token: string,
  groupId: string,
  skip: number,
  take: number,
): Promise<CommunityPost[]> {
  return apiRequest<CommunityPost[]>(
    `/api/v1/patient/community/groups/${groupId}/feed?skip=${skip}&take=${take}`,
    { method: 'GET', token },
  );
}

/**
 * Fetches a paginated list of comments for a specific post.
 * Comments are returned in chronological ascending order (oldest first).
 */
export async function getPostComments(
  token: string,
  postId: string,
  skip: number,
  take: number,
): Promise<CommunityComment[]> {
  return apiRequest<CommunityComment[]>(
    `/api/v1/patient/community/posts/${postId}/comments?skip=${skip}&take=${take}`,
    { method: 'GET', token },
  );
}

/**
 * Creates a new post in a community group.
 * Content must be 1–4000 characters (validated backend-side).
 */
export async function createPost(
  token: string,
  groupId: string,
  input: CreatePostInput,
): Promise<CreatePostResult> {
  return apiRequest<CreatePostResult>(
    `/api/v1/patient/community/groups/${groupId}/posts`,
    { method: 'POST', token, body: JSON.stringify(input) },
  );
}

/**
 * Creates a comment on a post.
 * Content must be 1–2000 characters (validated backend-side).
 *
 * Returns { commentId } on success. Comment listing is now available via
 * getPostComments — the UI loads the thread lazily via useComments.
 * Throws ApiError on failure so callers can handle the error state.
 */
export async function createComment(
  token: string,
  postId: string,
  input: CreateCommentInput,
): Promise<CreateCommentResult> {
  return apiRequest<CreateCommentResult>(
    `/api/v1/patient/community/posts/${postId}/comments`,
    { method: 'POST', token, body: JSON.stringify(input) },
  );
}

/**
 * Adds a qualitative reaction to a post.
 * Allowed types: apoyo | animo | gracias | me_identifico | fuerza (validated backend-side).
 * "Like" is explicitly NOT a valid type.
 */
export async function addReaction(
  token: string,
  postId: string,
  type: ReactionType,
): Promise<AddReactionResult> {
  return apiRequest<AddReactionResult>(
    `/api/v1/patient/community/posts/${postId}/reactions`,
    { method: 'POST', token, body: JSON.stringify({ type }) },
  );
}

/**
 * Removes the current user's reaction of a given type from a post.
 * Returns 204 No Content (idempotent). apiRequest already returns undefined for 204.
 */
export async function removeReaction(
  token: string,
  postId: string,
  type: ReactionType,
): Promise<void> {
  await apiRequest<void>(
    `/api/v1/patient/community/posts/${postId}/reactions/${type}`,
    { method: 'DELETE', token },
  );
}
