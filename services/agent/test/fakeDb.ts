import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { vi } from "vitest";

/**
 * Minimal in-memory stand-in for the TypeORM-backed `DatabaseClient`, enough
 * for the chat conversation store (findOne / findAndCount / save / softDelete).
 * Matches rows on `id` and `userId` where TypeORM `Equal()`/`IsNull()` operators
 * are reduced to their `.value`.
 */
export const createFakeDb = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type Row = Record<string, any>;
  const rows = new Map<string, Row>();
  const val = (v: unknown): unknown =>
    v && typeof v === "object" && "_type" in v
      ? v._type === "isNull"
        ? null
        : v._value
      : v;
  const matches = (row: Row, where: Row) =>
    Object.entries(where).every(([k, v]) => (row[k] ?? null) === val(v));
  return {
    rows,
    findOne: vi.fn((_e: unknown, o: { where: Row }) =>
      TE.right(
        [...rows.values()].find((r) => matches(r, o.where))
          ? O.some([...rows.values()].find((r) => matches(r, o.where)))
          : O.none,
      ),
    ),
    findAndCount: vi.fn((_e: unknown, o: { where: Row }) => {
      const found = [...rows.values()].filter((r) => matches(r, o.where));
      return TE.right([found, found.length] as const);
    }),
    save: vi.fn((_e: unknown, data: Row[]) => {
      const now = new Date();
      data.forEach((d) => {
        const prev = rows.get(d.id);
        rows.set(d.id, {
          createdAt: prev?.createdAt ?? now,
          ...d,
          updatedAt: now,
        });
      });
      return TE.right(data);
    }),
    softDelete: vi.fn((_e: unknown, c: Row) => {
      const found = [...rows.values()].filter((r) => matches(r, c));
      found.forEach((r) => rows.delete(r.id));
      return TE.right({ affected: found.length });
    }),
  };
};
