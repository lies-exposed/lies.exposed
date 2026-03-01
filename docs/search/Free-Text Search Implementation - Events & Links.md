---
title: Free-Text Search Implementation - Events & Links
type: note
permalink: search/free-text-search-implementation-events-links
---

# Free-Text Search Implementation: Events & Links

## Overview
Free-text search in lies.exposed uses different approaches for Events and Links:
- **Events**: PostgreSQL full-text search (tsvector/tsquery) with event-type-specific field mapping
- **Links**: Simple case-insensitive LIKE search on title and description

---

## 1. EVENTS - Full-Text Search Implementation

### Query Flow
1. **Route Handler**: `/services/api/src/routes/events/listEvents.controller.ts` and `searchEvents.controller.ts`
   - Both use the same underlying query: `searchEventV2Query`
   - Extract `q` parameter from query string
   
2. **Query Builder**: `/packages/@liexp/backend/src/queries/events/searchEventsV2.query.ts`
   - Main function: `searchEventV2Query(query)(context)`
   - Constructs TypeORM query builder with WHERE clauses

### Text Search Implementation Details

**Location**: `searchEventsV2.query.ts` lines 41-87

```typescript
const whereInTitle =
  (config: EventsConfig) =>
  (
    q: SelectQueryBuilder<EventV2Entity>,
    title: string,
  ): SelectQueryBuilder<EventV2Entity> => {
    // 1. Normalize input: remove special characters
    const trimmedWords = title
      .trim()
      .replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}[]\\\/]/gi, " ");

    // 2. Parse into tsquery format (takes up to 3 longest words)
    const tsQueryTitle = trimmedWords
      .split(" ")
      .sort((a, b) => b.length - a.length)
      .slice(0, 3)
      .join(" | ")
      .toLowerCase();

    // 3. Build WHERE clause using event-type-specific field mapping
    const cases = Object.entries(config).reduce(
      (acc, [key, value]) =>
        acc.concat(
          `WHEN event.type IN ('${key}') THEN ${value.whereTitleIn(q)}`
        ),
      [""],
    );

    // 4. PostgreSQL ts_rank_cd for full-text search
    const whereTitle = `ts_rank_cd(
      to_tsvector(
        'english',
        coalesce(
          CASE
            ${cases.join("\n")}
          END, ''
        )
      ),
      to_tsquery('english', :q)
    ) > 0.001`;

    // 5. Add WHERE clause with parameter
    return q.andWhere(whereTitle, {
      q: tsQueryTitle,
    });
  };
```

**Key Points**:
1. **Input Normalization**: Strips special characters, keeps only words
2. **Query Format**: PostgreSQL `to_tsquery` format with `|` (OR) operator
3. **Word Selection**: Takes up to 3 longest words from input
4. **Ranking**: Uses `ts_rank_cd` function with threshold > 0.001 to rank results
5. **Event-Type Aware**: Different event types search different JSON fields

### Event-Type-Specific Field Mapping

**Location**: `/packages/@liexp/backend/src/queries/config/index.ts`

Each event type has a `whereTitleIn()` function that returns the PostgreSQL field to search:

| Event Type | Search Field |
|------------|--------------|
| **Book** | `"event"."payload"::jsonb ->> 'title'::text` |
| **Death** | (configured in death.config.ts) |
| **ScientificStudy** | `"event"."payload"::jsonb ->> 'title'` |
| **Documentary** | `"event"."payload"::jsonb ->> 'title'` |
| **Patent** | (configured in patent.config.ts) |
| **Transaction** | `"event"."payload"::jsonb ->> 'description'` |
| **Quote** | `"event"."payload"::jsonb ->> 'quote'::text` |
| **Uncategorized** | `"event"."payload"::jsonb ->> 'title'` |

### WHERE Clause Integration

**Location**: `searchEventsV2.query.ts` lines 282-284

```typescript
if (O.isSome(title)) {
  q = whereInTitle(config)(q, title.value);
}
```

The search is applied as an `andWhere` clause in the context of other filters:
- If user provides `q` parameter → adds full-text search
- Can be combined with other filters (actors, groups, keywords, date ranges, etc.)

---

## 2. LINKS - Simple Text Search Implementation

### Query Flow
1. **Route Handler**: `/services/api/src/routes/links/listLinks.controller.ts`
   - Uses `fetchLinks(query, isAdmin)` from `fetchLinks.query.ts`
   - Extracts `q` parameter from query string

2. **Query Builder**: `/packages/@liexp/backend/src/queries/links/fetchLinks.query.ts`
   - Main function: `fetchLinks(query, isAdmin)(context)`
   - Simple case-insensitive LIKE search

### Text Search Implementation Details

**Location**: `fetchLinks.query.ts` lines 147-157

```typescript
if (O.isSome(search)) {
  const where = hasWhere ? q.andWhere.bind(q) : q.where.bind(q);

  where(
    "lower(link.title) LIKE :q OR lower(link.description) LIKE :q",
    {
      q: `%${search.value.toLowerCase()}%`,
    },
  );
  hasWhere = true;
}
```

**Key Points**:
1. **Simple LIKE Search**: Uses `LIKE` operator with wildcards (`%`)
2. **Case-Insensitive**: Converts both field and search term to lowercase
3. **Multi-Field**: Searches both `title` AND `description` fields
4. **Wildcard Match**: `%searchterm%` matches anywhere in the field
5. **SQL Injection Prevention**: Uses parameterized queries (`:q` parameter)

### Differences from Events Search

| Aspect | Events | Links |
|--------|--------|-------|
| **Technology** | PostgreSQL full-text search (tsvector/tsquery) | Simple LIKE operator |
| **Ranking** | Yes (ts_rank_cd) | No |
| **Word Analysis** | Normalized: longest 3 words with OR logic | Raw: exact match with wildcards |
| **Fields** | Event-type-specific JSON paths | Fixed: title + description |
| **Performance** | Uses tsvector index | Table scan (slower for large datasets) |
| **Relevance** | High (linguistic analysis) | Low (substring match) |

---

## 3. Query Parameter Names

Both routes use the same parameter name: **`q`**

- **Events**: `Endpoints.Event.List` and `Endpoints.Event.Custom.SearchEvents`
- **Links**: `Endpoints.Link.List`

The `q` parameter is extracted and passed to the respective query builders.

---

## 4. File Locations Summary

### Events Search
- **Route Handler**: `/services/api/src/routes/events/listEvents.controller.ts`
- **Query Builder**: `/packages/@liexp/backend/src/queries/events/searchEventsV2.query.ts`
- **Event Config**: `/packages/@liexp/backend/src/queries/config/`
  - `index.ts` - All event types mapping
  - `events/book.config.ts` - Book-specific
  - `events/death.config.ts` - Death-specific
  - `events/patent.config.ts` - Patent-specific

### Links Search
- **Route Handler**: `/services/api/src/routes/links/listLinks.controller.ts`
- **Query Builder**: `/packages/@liexp/backend/src/queries/links/fetchLinks.query.ts`

---

## 5. SQL Examples

### Events Full-Text Search (PostgreSQL)
```sql
-- Example for "Barack Obama"
ts_rank_cd(
  to_tsvector('english', "event"."payload"::jsonb ->> 'title'),
  to_tsquery('english', 'barack | obama')
) > 0.001
```

### Links Simple Search
```sql
-- Example for "climate"
lower(link.title) LIKE '%climate%' 
OR lower(link.description) LIKE '%climate%'
```

---

## 6. Performance Considerations

**Events**:
- Uses PostgreSQL full-text search with tsvector indexing
- More resource-intensive but linguistically aware
- Supports ranking and relevance scoring
- Good for large text content

**Links**:
- Simple LIKE search without indexes
- Fast for small datasets
- May become slow with thousands of links
- Could benefit from ILIKE or full-text search optimization

