import { pipe, fp } from "@liexp/core/lib/fp/index.js";

/**
 * Map entity relation arrays to their ID arrays.
 * Used in API controllers to prepare entity data for IO decoding.
 */
export const mapIds = <T extends { id: string }>(
  entities: readonly T[],
): string[] =>
  Array.from(
    pipe(
      entities,
      fp.A.map((e) => e.id),
    ),
  );

/**
 * Extract a single ID from an optional entity relation.
 * Returns the entity's id or null.
 */
export const extractId = <T extends { id: string }>(
  entity: T | null | undefined,
): string | null => (entity ? entity.id : null);
