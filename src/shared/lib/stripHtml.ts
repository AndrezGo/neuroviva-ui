/**
 * Pure HTML-stripping and entity-decoding utility — no framework dependencies.
 * Safe to import in any layer and unit-testable without mocking or a DOM.
 */

/** Named HTML entity map. Decoded in a single pass alongside numeric entities. */
const ENTITY_MAP = new Map<string, string>([
  ['&amp;', '&'],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&quot;', '"'],
  ['&#39;', "'"],
  ['&#039;', "'"],
  ['&apos;', "'"],
  ['&nbsp;', ' '],
  ['&hellip;', '…'],
  ['&mdash;', '—'],
  ['&ndash;', '–'],
]);

/**
 * Matches any HTML entity: named (&amp;), decimal (&#39;), or hex (&#x27;).
 * Used for a single-pass replacement so double-encoded sequences like
 * &amp;#39; produce a sensible result (&amp; → & leaving #39; as plain text).
 */
const ENTITY_RE = /&(?:#(?:x[0-9a-fA-F]+|\d+)|[a-zA-Z][a-zA-Z0-9]*);/g;

function decodeEntity(entity: string): string {
  const named = ENTITY_MAP.get(entity);
  if (named !== undefined) return named;

  // Numeric entity — extract the code point value.
  const inner = entity.slice(1, -1); // strip leading & and trailing ;
  if (inner.startsWith('#x') || inner.startsWith('#X')) {
    const cp = parseInt(inner.slice(2), 16);
    return Number.isNaN(cp) ? entity : String.fromCodePoint(cp);
  }
  if (inner.startsWith('#')) {
    const cp = parseInt(inner.slice(1), 10);
    return Number.isNaN(cp) ? entity : String.fromCodePoint(cp);
  }

  // Unknown named entity — return as-is.
  return entity;
}

/**
 * Strips HTML tags and decodes common HTML entities from a string.
 *
 * - Returns `''` for null, undefined, or empty input.
 * - Removes tags via a simple regex (not a full HTML parser).
 * - Decodes entities in a single pass (named + numeric decimal + numeric hex).
 * - Collapses runs of whitespace to a single space and trims the result.
 * - SSR-safe: no DOMParser, no document, no React dependencies.
 *
 * @param input Raw string that may contain HTML markup and/or entities.
 * @returns Plain text suitable for rendering directly in React (auto-escaped).
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return '';

  return input
    .replace(/<[^>]+>/g, '')       // 1. Remove HTML tags
    .replace(ENTITY_RE, decodeEntity) // 2. Decode entities (single pass)
    .replace(/\s+/g, ' ')          // 3. Collapse whitespace
    .trim();                        // 4. Remove surrounding whitespace
}
