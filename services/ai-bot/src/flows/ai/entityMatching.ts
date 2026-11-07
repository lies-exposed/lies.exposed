/**
 * Conservative name matching used when an AI flow wants to update an existing
 * platform entity it found by name.
 *
 * The API list endpoints do a fuzzy full-text search (`q`), so their first
 * result is NOT necessarily the entity the model was talking about. Blindly
 * editing `matches[0]` corrupted unrelated records in production (e.g. a dozen
 * different organisations all overwriting the same group). Only an
 * unambiguous, normalized exact match is accepted here.
 */

/** Lowercase, strip diacritics/punctuation and collapse whitespace. */
const normalizeName = (name: string): string =>
  name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

/**
 * All the normalized forms a name can be matched by:
 * "WHO (World Health Organization)" → ["who world health organization", "who", "world health organization"]
 */
const nameVariants = (name: string): string[] => {
  const variants = new Set<string>();
  const full = normalizeName(name);
  if (full) variants.add(full);

  const parenthesized = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(name);
  if (parenthesized) {
    const outside = normalizeName(parenthesized[1]);
    const inside = normalizeName(parenthesized[2]);
    if (outside) variants.add(outside);
    if (inside) variants.add(inside);
  }

  return Array.from(variants);
};

/**
 * Returns the single candidate whose name (or username) matches the wanted
 * name exactly after normalization. Returns `null` when nothing matches or
 * when more than one distinct candidate matches (ambiguous).
 */
export const pickExactMatch = <T extends { id: string }>(
  wanted: string,
  candidates: readonly T[],
  getNames: (c: T) => readonly (string | null | undefined)[],
): T | null => {
  const wantedVariants = new Set(nameVariants(wanted));
  if (wantedVariants.size === 0) return null;

  const matches = new Map<string, T>();
  for (const candidate of candidates) {
    const candidateVariants = getNames(candidate)
      .filter((n): n is string => !!n)
      .flatMap((n) => nameVariants(n.replace(/-/g, " ")));
    if (candidateVariants.some((v) => wantedVariants.has(v))) {
      matches.set(candidate.id, candidate);
    }
  }

  return matches.size === 1 ? Array.from(matches.values())[0] : null;
};

/** Parses a model-provided date, returning `null` for empty/invalid values. */
export const parseISODate = (
  value: string | null | undefined,
): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return null;
  const date = new Date(trimmed);
  return isNaN(date.getTime()) ? null : trimmed.substring(0, 10);
};
