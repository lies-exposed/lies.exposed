import { type MigrationInterface, type QueryRunner } from "typeorm";

/**
 * Fix data-quality issues in event_v2.payload where UUID fields contain raw
 * URLs instead of entity UUIDs, or URL strings instead of absent values.
 *
 * Problems addressed:
 *
 * 1. ScientificStudy.payload.image  (~67 rows)
 *    The AI-bot stored the article cover image URL directly instead of a
 *    Media entity UUID. The field is optional so we simply remove it.
 *
 * 2. ScientificStudy.payload.url  (5 rows)
 *    The source URL was stored verbatim instead of the UUID of a Link entity.
 *    - 2 events already have a matching Link row  → patch payload.url in-place.
 *    - 3 events have no Link row yet              → create the Link, then patch.
 *
 * 3. Documentary.payload.website  (1 row – cdeb63e5)
 *    Stored as an empty string instead of being absent.  Remove the key.
 */
export class FixEventPayloadURLs1771771505266 implements MigrationInterface {
  name = "FixEventPayloadURLs1771771505266";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Strip invalid image URLs from ScientificStudy payloads ────────────
    await queryRunner.query(`
      UPDATE event_v2
      SET payload = (payload::jsonb - 'image')::json
      WHERE type = 'ScientificStudy'
        AND payload->>'image' IS NOT NULL
        AND NOT (payload->>'image' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);

    // ── 2a. Patch the 2 events whose URL already has a matching Link row ─────
    await queryRunner.query(`
      UPDATE event_v2 e
      SET payload = jsonb_set(payload::jsonb, '{url}', to_jsonb(l.id::text))::json
      FROM link l
      WHERE e.type = 'ScientificStudy'
        AND l.url = RTRIM(e.payload->>'url', '?')
        AND e.payload->>'url' IS NOT NULL
        AND NOT (e.payload->>'url' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);

    // ── 2b. Create Link rows for the 3 events with no existing Link, then patch
    //        We use INSERT … ON CONFLICT DO NOTHING as a safeguard and JOIN back
    //        to resolve the id regardless of whether we just inserted or it
    //        already existed from a previous partial run.
    //        RTRIM strips any trailing '?' from URLs like 'https://…/nm.3985?'
    //        so the INSERT matches the clean URL the Link was created with.
    await queryRunner.query(`
      INSERT INTO link (url, title, status)
      SELECT
        RTRIM(e.payload->>'url', '?'),
        COALESCE(e.payload->>'title', RTRIM(e.payload->>'url', '?')),
        'APPROVED'
      FROM event_v2 e
      LEFT JOIN link l ON l.url = RTRIM(e.payload->>'url', '?')
      WHERE e.type = 'ScientificStudy'
        AND e.payload->>'url' IS NOT NULL
        AND NOT (e.payload->>'url' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
        AND l.id IS NULL
      ON CONFLICT (url) DO NOTHING
    `);

    await queryRunner.query(`
      UPDATE event_v2 e
      SET payload = jsonb_set(payload::jsonb, '{url}', to_jsonb(l.id::text))::json
      FROM link l
      WHERE e.type = 'ScientificStudy'
        AND l.url = RTRIM(e.payload->>'url', '?')
        AND e.payload->>'url' IS NOT NULL
        AND NOT (e.payload->>'url' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);

    // ── 3. Strip empty-string website from Documentary payload ───────────────
    await queryRunner.query(`
      UPDATE event_v2
      SET payload = (payload::jsonb - 'website')::json
      WHERE type = 'Documentary'
        AND payload->>'website' IS NOT NULL
        AND NOT (payload->>'website' ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$')
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Restoring the original bad data is intentionally a no-op:
    // this migration only removes invalid values, there is nothing safe to put back.
  }
}
