import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { slateToBlockNote } from "@liexp/shared/lib/providers/blocknote/slateToBlockNote.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { type CommandFlow } from "./command.type.js";

/** table and column names are constants: they are safe to interpolate in SQL */
const TARGETS = [
  ["actor", "excerpt"],
  ["actor", "body"],
  ["actor_relation", "excerpt"],
  ["area", "body"],
  ["event", "excerpt"],
  ["event", "body"],
  ["group", "excerpt"],
  ["group", "body"],
  ["group_member", "excerpt"],
  ["group_member", "body"],
  ["page", "excerpt"],
  ["page", "body"],
  ["story", "body"],
] as const;

const BACKUP_TABLE = "slate_blocknote_backup";

interface Row {
  id: string;
  value: unknown;
  /** the stored text, used to write only if the row did not change meanwhile */
  raw: string;
}

interface Change {
  id: string;
  raw: string;
  next: string | null;
}

export const migrateSlateToBlockNote: CommandFlow = async (
  ctx,
  args,
): Promise<void> => {
  if (args.includes("--help") || args.includes("-h")) {
    ctx.logger.info.log(`
Usage: migrate-slate-to-blocknote [--apply]

Convert the legacy slate excerpts and bodies to BlockNote documents.

Without --apply nothing is written: the command only reports what would change.

With --apply the original values are first copied to the "${BACKUP_TABLE}"
table. Each column is migrated in its own transaction. Values with content that
cannot be mapped are skipped.
`);
    return;
  }

  const apply = args.includes("--apply");

  const migrateColumn = (table: string, column: string) => {
    const label = `${table}.${column}`;

    return pipe(
      ctx.db.execQuery((em): Promise<Row[]> =>
        em.query(
          `SELECT id, "${column}" AS value, "${column}"::text AS raw FROM "${table}" WHERE "${column}" IS NOT NULL ORDER BY id`,
        ),
      ),
      fp.TE.chain((rows) => {
        const stats = { converted: 0, empty: 0, unchanged: 0, failed: 0 };
        const changes: Change[] = [];

        for (const row of rows) {
          const result = slateToBlockNote(row.value);
          stats[result.type]++;
          if (result.type === "unchanged") {
            continue;
          }
          for (const warning of result.warnings) {
            ctx.logger.info.log(`[WARN] ${label} ${row.id}: ${warning}`);
          }
          if (result.type === "failed") {
            ctx.logger.error.log(
              `[SKIP] ${label} ${row.id}: ${result.unmapped.join(", ")}`,
            );
            continue;
          }
          changes.push({
            id: row.id,
            raw: row.raw,
            next:
              result.type === "converted" ? JSON.stringify(result.value) : null,
          });
        }

        ctx.logger.info.log(
          `[${apply ? "APPLY" : "DRY-RUN"}] ${label}: ${rows.length} rows — convert ${stats.converted}, set null ${stats.empty}, unchanged ${stats.unchanged}, skipped ${stats.failed}`,
        );

        if (!apply || changes.length === 0) {
          return fp.TE.right(undefined);
        }

        return ctx.db.execQuery((em) =>
          em.transaction(async (tx) => {
            for (const change of changes) {
              await tx.query(
                `INSERT INTO "${BACKUP_TABLE}" (table_name, column_name, row_id, value) VALUES ($1, $2, $3, $4)`,
                [table, column, change.id, change.raw],
              );
              // raw SQL on purpose: "updatedAt" must not change
              await tx.query(
                `UPDATE "${table}" SET "${column}" = $1 WHERE id = $2 AND "${column}"::text = $3`,
                [change.next, change.id, change.raw],
              );
            }
          }),
        );
      }),
    );
  };

  const createBackupTable = ctx.db.execQuery((em) =>
    em.query(
      `CREATE TABLE IF NOT EXISTS "${BACKUP_TABLE}" (table_name text NOT NULL, column_name text NOT NULL, row_id uuid NOT NULL, value json NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`,
    ),
  );

  await pipe(
    apply ? createBackupTable : fp.TE.right(undefined),
    fp.TE.chain(() =>
      pipe(
        [...TARGETS],
        fp.A.traverse(fp.TE.ApplicativeSeq)(([table, column]) =>
          migrateColumn(table, column),
        ),
      ),
    ),
    throwTE,
  );
};
