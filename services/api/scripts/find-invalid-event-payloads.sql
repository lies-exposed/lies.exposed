-- Find events with payload fields that fail UUID validation
-- Covers all event types stored in event_v2 with a payload JSON column.
-- UUID pattern: 8-4-4-4-12 lower-case hex digits

WITH uuid_re AS (
  SELECT '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' AS p
)
SELECT id, type, reason, bad_value FROM (

  -- ── ScientificStudy ──────────────────────────────────────────────────────
  -- url: required UUID
  SELECT id, type,
    'ScientificStudy.payload.url must be UUID' AS reason,
    payload->>'url' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'ScientificStudy'
    AND (
      payload->>'url' IS NULL
      OR NOT (payload->>'url' ~ uuid_re.p)
    )

  UNION ALL

  -- image: optional UUID (must be UUID if present)
  SELECT id, type,
    'ScientificStudy.payload.image must be UUID or absent' AS reason,
    payload->>'image' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'ScientificStudy'
    AND payload->>'image' IS NOT NULL
    AND NOT (payload->>'image' ~ uuid_re.p)

  UNION ALL

  -- publisher: optional UUID
  SELECT id, type,
    'ScientificStudy.payload.publisher must be UUID or absent' AS reason,
    payload->>'publisher' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'ScientificStudy'
    AND payload->>'publisher' IS NOT NULL
    AND NOT (payload->>'publisher' ~ uuid_re.p)

  UNION ALL

  -- ── Death ────────────────────────────────────────────────────────────────
  -- victim: required UUID
  SELECT id, type,
    'Death.payload.victim must be UUID' AS reason,
    payload->>'victim' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'Death'
    AND (
      payload->>'victim' IS NULL
      OR NOT (payload->>'victim' ~ uuid_re.p)
    )

  UNION ALL

  -- location: optional UUID
  SELECT id, type,
    'Death.payload.location must be UUID or absent' AS reason,
    payload->>'location' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'Death'
    AND payload->>'location' IS NOT NULL
    AND NOT (payload->>'location' ~ uuid_re.p)

  UNION ALL

  -- ── Documentary ──────────────────────────────────────────────────────────
  -- media: required UUID
  SELECT id, type,
    'Documentary.payload.media must be UUID' AS reason,
    payload->>'media' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'Documentary'
    AND (
      payload->>'media' IS NULL
      OR NOT (payload->>'media' ~ uuid_re.p)
    )

  UNION ALL

  -- website: optional UUID
  SELECT id, type,
    'Documentary.payload.website must be UUID or absent' AS reason,
    payload->>'website' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'Documentary'
    AND payload->>'website' IS NOT NULL
    AND NOT (payload->>'website' ~ uuid_re.p)

  UNION ALL

  -- ── Patent ───────────────────────────────────────────────────────────────
  -- source: optional UUID
  SELECT id, type,
    'Patent.payload.source must be UUID or absent' AS reason,
    payload->>'source' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'Patent'
    AND payload->>'source' IS NOT NULL
    AND NOT (payload->>'source' ~ uuid_re.p)

  UNION ALL

  -- ── Book ─────────────────────────────────────────────────────────────────
  -- media.pdf: required UUID
  SELECT id, type,
    'Book.payload.media.pdf must be UUID' AS reason,
    payload->'media'->>'pdf' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'Book'
    AND (
      payload->'media'->>'pdf' IS NULL
      OR NOT (payload->'media'->>'pdf' ~ uuid_re.p)
    )

  UNION ALL

  -- media.audio: optional UUID
  SELECT id, type,
    'Book.payload.media.audio must be UUID or absent' AS reason,
    payload->'media'->>'audio' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'Book'
    AND payload->'media'->>'audio' IS NOT NULL
    AND NOT (payload->'media'->>'audio' ~ uuid_re.p)

  UNION ALL

  -- ── Uncategorized ────────────────────────────────────────────────────────
  -- location: optional UUID
  SELECT id, type,
    'Uncategorized.payload.location must be UUID or absent' AS reason,
    payload->>'location' AS bad_value
  FROM event_v2, uuid_re
  WHERE type = 'Uncategorized'
    AND payload->>'location' IS NOT NULL
    AND NOT (payload->>'location' ~ uuid_re.p)

) AS problems
ORDER BY type, reason, id;
