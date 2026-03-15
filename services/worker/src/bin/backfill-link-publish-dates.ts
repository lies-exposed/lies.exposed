import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { IsNull } from "typeorm";
import { type CommandFlow } from "./command.type.js";

function isoToDate(iso: string | null): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

type LinkOutcome = "updated" | "skipped" | "failed";
type ChunkStats = Record<LinkOutcome, number>;

const CHUNK_SIZE = 20;

export const backfillLinkPublishDates: CommandFlow = async (
  ctx,
  args,
): Promise<void> => {
  const isDryRun = args.includes("--dry-run");
  const isHelp = args.includes("--help") || args.includes("-h");
  const limitStr = args.find((a) => /^\d+$/.test(a));

  if (isHelp) {
    ctx.logger.info.log(`
Usage: backfill-link-publish-dates [limit] [options]

Backfill publishDate for links that have none.

Arguments:
  limit         Optional number of links to process (default: all)

Options:
  --dry-run     Log what would be updated without making DB writes
  --help, -h    Show this help message

Extraction strategy (first match wins, via fetchMetadata):
  1. JSON-LD blocks: datePublished / dateCreated (including nested @graph)
  2. HTML meta tags: article:published_time (og+name), datePublished (itemprop),
     date, pubdate, DC.date.issued, article:modified_time (fallback)
  3. URL path patterns: /YYYY/MM/DD, -YYYY-MM-DD, /YYYYMMDD/, ?date=YYYY-MM-DD
  4. Wayback Machine CDX API (last resort for inaccessible pages)

Links within each chunk (${CHUNK_SIZE}) are fetched in parallel.

Examples:
  backfill-link-publish-dates 10 --dry-run   # Preview first 10
  backfill-link-publish-dates 50             # Update up to 50 links
`);
    return;
  }

  const limit = limitStr ? parseInt(limitStr, 10) : undefined;

  ctx.logger.info.log("Starting backfill-link-publish-dates", {
    limit,
    isDryRun,
  });

  // Returns an outcome per link — no shared mutable state, safe for parallel execution.
  const processLink = (link: LinkEntity): TE.TaskEither<Error, LinkOutcome> =>
    pipe(
      // Delegate to fetchMetadata which runs: JSON-LD → HTML meta → URL patterns → Wayback CDX
      ctx.urlMetadata.fetchMetadata(
        link.url,
        { timeout: 15_000 },
        (e) => new Error(String(e)),
      ),
      fp.TE.map((meta) => {
        const d = isoToDate(meta.date ?? null);
        if (d) {
          ctx.logger.debug.log(`[META] ${link.url} → ${d.toISOString()}`);
        }
        return d;
      }),
      fp.TE.orElse(() => TE.right<Error, Date | null>(null)),
      fp.TE.chain((publishDate): TE.TaskEither<Error, LinkOutcome> => {
        if (publishDate === null) {
          ctx.logger.info.log(`[SKIP] ${link.url} — no date found`);
          return TE.right("skipped");
        }
        ctx.logger.info.log(
          `[${isDryRun ? "DRY-RUN" : "UPDATE"}] ${link.url} → ${publishDate.toISOString()}`,
        );
        if (isDryRun) {
          return TE.right("updated");
        }
        return pipe(
          ctx.db.save(LinkEntity, [
            { ...link, publishDate, updatedAt: new Date() },
          ]),
          fp.TE.mapLeft((e) => new Error(String(e))),
          fp.TE.map((): LinkOutcome => "updated"),
          fp.TE.orElse((e) => {
            ctx.logger.error.log(`[FAIL] ${link.url} — ${e.message}`);
            return TE.right<Error, LinkOutcome>("failed");
          }),
        );
      }),
    );

  const processLinks = (): TE.TaskEither<Error, void> => {
    const totals: ChunkStats = { updated: 0, skipped: 0, failed: 0 };

    // Updated rows disappear from the result set (publishDate no longer NULL).
    // Skipped/failed rows stay, so `skip` only needs to advance past those.
    const loop = (
      skip: number,
      processed: number,
    ): TE.TaskEither<Error, void> => {
      const chunkSize = limit
        ? Math.min(CHUNK_SIZE, limit - processed)
        : CHUNK_SIZE;

      if (chunkSize <= 0) {
        ctx.logger.info.log(
          `Done. Updated: ${totals.updated}, Skipped: ${totals.skipped}, Failed: ${totals.failed} (of ${processed} processed)`,
        );
        return TE.right(undefined);
      }

      return pipe(
        ctx.db.find(LinkEntity, {
          where: { publishDate: IsNull(), deletedAt: IsNull() },
          select: ["id", "url"],
          skip,
          take: chunkSize,
          order: { createdAt: "DESC", id: "ASC" },
        }),
        fp.TE.mapLeft((e) => new Error(String(e))),
        fp.TE.chain((links) => {
          if (links.length === 0) {
            ctx.logger.info.log(
              `Done. Updated: ${totals.updated}, Skipped: ${totals.skipped}, Failed: ${totals.failed} (of ${processed} processed)`,
            );
            return TE.right(undefined);
          }

          ctx.logger.info.log(
            `Processing chunk skip=${skip} size=${links.length}`,
          );

          return pipe(
            links.map(processLink),
            fp.A.sequence(fp.TE.ApplicativePar),
            fp.TE.chain((outcomes) => {
              const chunkStats: ChunkStats = {
                updated: 0,
                skipped: 0,
                failed: 0,
              };
              for (const o of outcomes) chunkStats[o]++;

              totals.updated += chunkStats.updated;
              totals.skipped += chunkStats.skipped;
              totals.failed += chunkStats.failed;

              ctx.logger.info.log(
                `Chunk done — updated: ${chunkStats.updated}, skipped: ${chunkStats.skipped}, failed: ${chunkStats.failed} | totals: ${totals.updated}/${totals.skipped}/${totals.failed}`,
              );

              // Updated rows dropped out of the NULL set; advance skip only
              // past the rows that remain (skipped + failed in this chunk).
              const nextSkip = skip + chunkStats.skipped + chunkStats.failed;
              return loop(nextSkip, processed + outcomes.length);
            }),
          );
        }),
      );
    };

    return loop(0, 0);
  };

  await pipe(processLinks(), throwTE);
};
