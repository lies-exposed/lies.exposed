import { type ObjectLiteral, type SelectQueryBuilder } from "typeorm";

export interface FTSWhereResult {
  whereClause: string;
  params: { ftsQ: string };
}

const ftsWhereClause = (tsvectorExpr: string): string =>
  `ts_rank_cd(
    to_tsvector('simple', ${tsvectorExpr}),
    websearch_to_tsquery('simple', :ftsQ)
  ) > 0`;

/**
 * Builds a PostgreSQL full-text search WHERE clause using `websearch_to_tsquery`
 * with the `simple` dictionary (language-agnostic, no stemming).
 *
 * Combines multiple column expressions into a single tsvector using `coalesce`
 * and `||` concatenation, then ranks matches with `ts_rank_cd`.
 *
 * @param fields - Column expressions to search (e.g. `["actor.fullName", "actor.username"]`).
 *                 These are embedded directly in SQL — only pass trusted internal values.
 * @param searchTerm - The raw user search string (passed as a parameterised value, safe from injection).
 * @returns `{ whereClause, params }` ready for use with TypeORM's `andWhere(clause, params)`.
 *
 * @example
 * const { whereClause, params } = buildFTSWhere(["actor.fullName", "actor.username"], search.value);
 * q.andWhere(whereClause, params);
 */
export const buildFTSWhere = (
  fields: string[],
  searchTerm: string,
): FTSWhereResult => {
  const tsvector = fields
    .map((f) => `coalesce(${f}::text, '')`)
    .join(` || ' ' || `);

  return {
    whereClause: ftsWhereClause(tsvector),
    params: { ftsQ: searchTerm },
  };
};

/**
 * Variant of `buildFTSWhere` for cases where the tsvector source expression is
 * already fully formed (e.g. a SQL CASE expression). The expression is used as-is
 * inside `to_tsvector('simple', ...)` — only pass trusted internal SQL values.
 *
 * @example
 * // events use a CASE expression across event types:
 * const { whereClause, params } = buildFTSWhereRaw("coalesce(CASE WHEN ... END, '')", search.value);
 * q.andWhere(whereClause, params);
 */
export const buildFTSWhereRaw = (
  tsvectorExpr: string,
  searchTerm: string,
): FTSWhereResult => ({
  whereClause: ftsWhereClause(tsvectorExpr),
  params: { ftsQ: searchTerm },
});

/**
 * Convenience wrapper that applies `buildFTSWhere` directly to a TypeORM query builder.
 * Uses `andWhere` so it can be chained safely after other conditions.
 */
export const applyFTSWhere = <T extends ObjectLiteral>(
  q: SelectQueryBuilder<T>,
  fields: string[],
  searchTerm: string,
): SelectQueryBuilder<T> => {
  const { whereClause, params } = buildFTSWhere(fields, searchTerm);
  return q.andWhere(whereClause, params);
};

/**
 * Returns a SQL expression that extracts all inline text from a BlockNote JSON column.
 *
 * BlockNote stores documents as `[{ content: [{ text: "..." }, ...], children: [...] }]`.
 * This expression uses `jsonb_path_query` with the recursive `**` operator to find every
 * `text` string at any nesting depth, then aggregates them into a single space-separated string.
 *
 * The resulting expression can be passed as one of the `fields` to `buildFTSWhere`.
 *
 * @param column - Fully-qualified column reference (e.g. `"actor"."excerpt"`).
 *                 Must be a trusted internal value — never interpolate user input here.
 *
 * @example
 * applyFTSWhere(q, [
 *   "actor.fullName",
 *   blockNoteTextExpr('"actor"."excerpt"'),
 *   blockNoteTextExpr('"actor"."body"'),
 * ], search.value);
 */
export const blockNoteTextExpr = (column: string): string =>
  `coalesce((SELECT string_agg(t.val #>> '{}', ' ') FROM jsonb_path_query(${column}::jsonb, '$.**.text') AS t(val)), '')`;
