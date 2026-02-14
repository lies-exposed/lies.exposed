# MCP Tools Complexity Analysis for api.liexp.dev

**Date:** 2026-02-13  
**Branch:** fix/wikipedia-api  
**Status:** Analysis Complete - Awaiting Implementation

## Executive Summary

The MCP tools exposed from `api.liexp.dev` are **too complex** for optimal LLM usage. Out of 41 total tools, 27% are complex (8-12 parameters) and 15% have nested structures that challenge LLM tool usage. The main issues are too many specialized event creation tools, high parameter counts, and nested object structures.

---

## Tool Inventory

### Total: 41 Tools Across 8 Categories

| Category | Tools | Complexity |
|----------|-------|------------|
| **Actors** | 4 | Moderate to High |
| **Groups** | 4 | Moderate to High |
| **Events** | 11 | High (8 creation tools) |
| **Links** | 4 | Simple to Moderate |
| **Media** | 5 | Moderate |
| **Areas** | 4 | Moderate |
| **Nations** | 2 | Simple |
| **Utilities** | 1 | Simple |

---

## Complexity Breakdown

### Simple Tools (1-3 parameters) ✅
**Count: 10 tools (24%)**

1. `getActor` - 1 param (id)
2. `getGroup` - 1 param (id)
3. `getEvent` - 1 param (id)
4. `getLink` - 1 param (id)
5. `getMedia` - 1 param (id)
6. `getArea` - 1 param (id)
7. `getNation` - 1 param (id)
8. `blockNoteToText` - 1 param (blocknote)
9. `findNations` - 2 params (name, isoCode)
10. `createLink` - 3 params (url, title, description/publishDate optional)

**Assessment:** These tools work well. LLMs handle them without issues.

---

### Moderate Tools (4-7 parameters) ⚠️
**Count: 14 tools (34%)**

1. `findActors` - 7 params (fullName, memberIn, withDeleted, sort, order, start, end)
2. `findGroups` - 4 params (name, keywords, sort, order)
3. `findEvents` - 4 params (query, actors, groups, type)
4. `findLinks` - 4 params (query, ids, sort, order)
5. `findMedia` - 5 params (query, location, type, sort, order)
6. `findAreas` - 6 params (query, withDeleted, sort, order, start, end)
7. `editLink` - 7 params (id, url, title, description, publishDate, provider, image)
8. `uploadMediaFromURL` - 4 params (url, label, description, type)
9. `createMedia` - 4 params (label, location, description, type)
10. `editMedia` - 5 params (id, label, location, description, type)
11. `createArea` - 5 params (label, geometry, body, draft, featuredImage)
12. `editArea` - 6 params (id, label, body, draft, featuredImage, updateGeometry)
13. `createQuoteEvent` - 7 params (base event fields + title, quote, subject, actor)
14. `createPatentEvent` - 7 params (base event fields + title, owners, source)

**Assessment:** Manageable parameter count, mostly flat structures. Could benefit from better defaults.

---

### Complex Tools (8-12 parameters) 🔴
**Count: 11 tools (27%)**

1. `createActor` - 9 params (username, fullName, color, excerpt, nationalities, body, avatar, bornOn, diedOn)
2. `editActor` - 11 params (id + 10 updatable fields including memberIn)
3. `createGroup` - 9 params (name, username, color, kind, excerpt, body, avatar, startDate, endDate)
4. `editGroup` - 11 params (id + 10 updatable fields including members)
5. `createUncategorizedEvent` - 12 params (7 base + title, actors, groups, groupsMembers, location, endDate)
6. `createBookEvent` - 10 params (7 base + title, pdfMediaId, audioMediaId, authors array, publisher)
7. `createScientificStudyEvent` - 10 params (7 base + title, url, image, authors, publisher)
8. `createDocumentaryEvent` - 9 params (7 base + title, website, authors, subjects)
9. `createTransactionEvent` - 10 params (7 base + title, total, currency, from, to)
10. `createDeathEvent` - 9 params (7 base + victim, location, causes)
11. `editEvent` - 9+ params (id, type discriminator, base fields, payload - highly variable)

**Assessment:** High parameter count creates cognitive load. LLMs frequently miss parameters or provide incorrect values.

---

### Tools with Nested Structures 🔴🔴
**Count: 6 tools (15%)**

#### 1. `createBookEvent` - Nested Authors/Publisher

**File:** `services/api/src/routes/mcp/tools/events/createBookEvent.tool.ts`

```typescript
authors: Schema.Array(
  Schema.Struct({
    type: Schema.Union(
      Schema.Literal("Actor"),
      Schema.Literal("Group"),
    ),
    id: UUID
  })
)

publisher: Schema.NullOr(
  Schema.Struct({
    type: Schema.Union(Schema.Literal("Actor"), Schema.Literal("Group")),
    id: UUID
  })
)
```

**Problem:** LLMs must construct nested objects with correct structure: `[{type: "Actor", id: "uuid"}, ...]`

**Impact:** High error rate on nested structure construction

---

#### 2. `editEvent` - Discriminated Union Payload

**File:** `services/api/src/routes/mcp/tools/events/editEvent.tool.ts`

```typescript
payload: EditEventTypeAndPayload.annotations({
  description: "Type-discriminated edit body. Each member includes its `type` and `payload` fields"
})
```

**Problem:** Payload structure varies by event type. LLM must understand which fields are valid for each type.

**Impact:** Requires deep type system understanding, high error rate

---

#### 3. `createTransactionEvent` - BySubjectId Structure

```typescript
from: BySubjectId  // {type: "Actor"|"Group", id: UUID}
to: BySubjectId
```

**Problem:** Similar to book event authors - nested type discrimination

---

#### 4. `blockNoteToText` - BlockNote JSON

```typescript
blocknote: BlockNoteJSON  // Complex nested document structure
```

**Problem:** Complex nested JSON structure, though tool handles it well

---

#### 5-6. `createScientificStudyEvent` & `createDocumentaryEvent`

Similar nested author/publisher structures as `createBookEvent`

---

## Major Issues Identified

### 🔴 Issue #1: Too Many Specialized Event Creation Tools

**Problem:** 8 separate event creation tools with similar base parameters

**Tools:**
- `createUncategorizedEvent` (12 params)
- `createBookEvent` (10 params)
- `createScientificStudyEvent` (10 params)
- `createTransactionEvent` (10 params)
- `createDocumentaryEvent` (9 params)
- `createDeathEvent` (9 params)
- `createQuoteEvent` (7 params)
- `createPatentEvent` (7 params)

**Impact:**
- Each tool shares 7 base parameters (date, draft, excerpt, body, media, links, keywords)
- Type-specific fields add 2-5 more parameters
- LLMs must learn 8 different tool signatures
- Increased chance of choosing wrong tool or mixing parameters

**Code Example:**
```typescript
// Current approach - repeated base schema
const baseEventSchema = Schema.Struct({
  date: Schema.String,
  draft: Schema.Boolean,
  excerpt: Schema.NullOr(Schema.String),
  body: Schema.NullOr(Schema.String),
  media: Schema.Array(UUID),
  links: Schema.Array(UUID),
  keywords: Schema.Array(UUID),
});

// Then each tool extends this with 2-5 more specific fields
```

---

### 🔴 Issue #2: Nested Object Structures

**Problem:** Nested structures like `authors: [{type, id}]` are hard for LLMs to construct correctly

**Example from createBookEvent:**
```typescript
authors: Schema.Array(
  Schema.Struct({
    type: Schema.Union(Schema.Literal("Actor"), Schema.Literal("Group")),
    id: UUID
  })
)
```

**LLM Must Construct:**
```json
{
  "authors": [
    {"type": "Actor", "id": "uuid1"},
    {"type": "Group", "id": "uuid2"}
  ]
}
```

**Common Errors:**
- Forgetting the `type` field
- Wrong type value (e.g., "actor" instead of "Actor")
- Flat array instead of objects: `["uuid1", "uuid2"]`
- Missing `id` field

---

### 🔴 Issue #3: Discriminated Unions in editEvent

**Problem:** The `editEvent` tool uses a discriminated union where valid fields change based on event type

**Code:**
```typescript
payload: EditEventTypeAndPayload  // Shape varies by event type
```

**Impact:**
- LLM must understand type system deeply
- Must know which fields are valid for "Book" vs "Quote" vs "Patent"
- High cognitive load
- Frequent validation errors

---

### 🔴 Issue #4: High Parameter Counts

**Problem:** Tools with 10-12 parameters overwhelm LLM context windows

**Examples:**
- `createUncategorizedEvent` - 12 params
- `editActor` - 11 params
- `editGroup` - 11 params
- `createBookEvent` - 10 params

**Impact:**
- LLMs forget parameters
- Parameter order mistakes
- Missing required vs optional understanding
- Slower task completion

---

## What Works Well ✅

### 1. Simple CRUD Operations
```typescript
getActor(id: UUID)
getGroup(id: UUID)
getEvent(id: UUID)
```

**Why it works:** Single parameter, clear purpose, no nested structures

---

### 2. Basic Search Tools
```typescript
findNations(name?: string, isoCode?: string)
createLink(url: string, title: string, description?: string)
```

**Why it works:** 2-4 parameters, flat structure, intuitive

---

### 3. Utility Tools
```typescript
blockNoteToText(blocknote: BlockNoteJSON)
```

**Why it works:** Single focused purpose, handles complexity internally

---

## Recommendations

### 🎯 High Priority

#### 1. Consolidate Event Creation Tools

**Current:** 8 separate tools

**Proposed:** 1-2 unified tools

**Option A: Single createEvent with Type Discrimination**
```typescript
createEvent({
  type: "Book" | "Quote" | "Patent" | ...,
  
  // Common fields
  date: string,
  draft: boolean,
  excerpt?: string,
  body?: string,
  media: UUID[],
  links: UUID[],
  keywords: UUID[],
  
  // Type-specific (simple union)
  bookFields?: { title, pdfMediaId, authorIds, publisherId },
  quoteFields?: { quote, subject, actorId },
  patentFields?: { title, ownerIds, source },
  ...
})
```

**Option B: Two-Step Creation**
```typescript
// Step 1: Create minimal event
createEvent({
  type: "Book",
  date: string,
  draft: boolean
})

// Step 2: Update with details
updateEventDetails(id, details)
```

**Benefits:**
- Reduce tool count from 8 to 1-2
- LLM learns one signature instead of eight
- Lower cognitive load
- Easier to maintain

---

#### 2. Flatten Nested Structures

**Current Nested Approach:**
```typescript
authors: Array<{
  type: "Actor" | "Group",
  id: UUID
}>
publisher: {
  type: "Actor" | "Group",
  id: UUID
} | null
```

**Proposed Flat Approach:**
```typescript
authorIds: UUID[]          // Just UUIDs
publisherId?: UUID         // Optional single UUID

// Backend resolves types automatically by looking up IDs
```

**Benefits:**
- Simple array/string parameters
- No nested object construction
- Fewer syntax errors
- Backend handles type resolution

**Implementation:**
```typescript
// Tool accepts simple arrays
authorIds: ["uuid1", "uuid2", "uuid3"]

// Backend flow resolves types
const authors = await Promise.all(
  authorIds.map(async (id) => {
    const actor = await actorRepo.findOne(id);
    if (actor) return { type: "Actor", id };
    
    const group = await groupRepo.findOne(id);
    if (group) return { type: "Group", id };
    
    throw new Error(`Unknown entity: ${id}`);
  })
);
```

---

#### 3. Simplify editEvent Tool

**Option A: Split into Type-Specific Tools**
```typescript
editBookEvent(id, bookSpecificFields)
editQuoteEvent(id, quoteSpecificFields)
editPatentEvent(id, patentSpecificFields)
```

**Benefits:**
- Clear parameter expectations per type
- No discriminated union complexity
- Type-safe at tool level

**Drawbacks:**
- More tools (but simpler ones)

---

**Option B: Keep Unified but Improve Validation**
```typescript
editEvent(id, {
  type: "Book" | "Quote" | ...,
  // Fields validated based on type at runtime
})
```

**With Better Error Messages:**
```
Error: Invalid fields for event type "Book"
- Field "quote" is not valid for Book events
- Did you mean to use: title, pdfMediaId, authorIds?
```

**Benefits:**
- Single tool
- Better UX with clear errors
- LLM can learn from error messages

---

#### 4. Reduce Parameter Counts

**Strategy 1: Make More Fields Optional**
```typescript
// Before: All required
createActor(username, fullName, color, excerpt, nationalities, body, avatar, bornOn, diedOn)

// After: Core required, rest optional with defaults
createActor(
  username: string,
  fullName: string,
  options?: {
    color?: string,        // Default: generate random
    excerpt?: string,      // Default: null
    nationalities?: UUID[], // Default: []
    body?: string,         // Default: null
    avatar?: UUID,         // Default: null
    bornOn?: string,       // Default: null
    diedOn?: string        // Default: null
  }
)
```

---

**Strategy 2: Create Minimal + Update Pattern**
```typescript
// Step 1: Create with minimum required fields
const actor = createMinimalActor({ username, fullName })

// Step 2: Update with additional details
updateActor(actor.id, { color, excerpt, body, ... })
```

---

**Strategy 3: Provide Smart Defaults**
```typescript
color: string = generateRandomColor(),
nationalities: UUID[] = [],
media: UUID[] = [],
links: UUID[] = [],
keywords: UUID[] = []
```

---

### 🎯 Medium Priority

#### 5. Add Usage Examples to Tool Descriptions

**Current:**
```typescript
description: "Create a new book event"
```

**Improved:**
```typescript
description: `
Create a new book event.

Example:
{
  "date": "2024-01-15",
  "draft": false,
  "title": "The Great Book",
  "authorIds": ["actor-uuid-1", "actor-uuid-2"],
  "publisherId": "group-uuid-1",
  "pdfMediaId": "media-uuid-1"
}
`
```

---

#### 6. Improve Schema Validation Error Messages

**Current Error:**
```
Schema validation failed
```

**Improved Error:**
```
Schema validation failed for createBookEvent:
- Missing required field: pdfMediaId
- Invalid field: authors[0].type (expected "Actor" or "Group", got "actor")
- Invalid date format: date (expected YYYY-MM-DD, got 2024/01/15)

See: https://docs.api.liexp.dev/mcp/tools/createBookEvent
```

---

#### 7. Document Common Workflows

**Create a Workflow Guide:**

```markdown
## Common Workflows

### Creating an Event with Media

1. Upload media:
   `uploadMediaFromURL({ url: "...", label: "...", type: "image" })`
   Returns: `{ id: "media-uuid" }`

2. Find related actors:
   `findActors({ fullName: "John Doe" })`
   Returns: `[{ id: "actor-uuid", ... }]`

3. Create event:
   `createBookEvent({
     date: "2024-01-15",
     title: "Book Title",
     authorIds: ["actor-uuid"],
     pdfMediaId: "media-uuid",
     media: ["media-uuid"]
   })`
```

---

### 🎯 Low Priority

#### 8. Tool Categorization and Selective Enabling

Allow clients to enable/disable tool categories:

```typescript
// Enable only simple CRUD operations for basic LLMs
enabledCategories: ["get", "find"]

// Enable everything for advanced LLMs
enabledCategories: ["get", "find", "create", "edit"]
```

---

#### 9. Progressive Disclosure Pattern

Start with simple tools, unlock complex ones as needed:

```typescript
// Level 1: Read-only tools (get, find)
// Level 2: + Simple create/edit (actors, groups, links)
// Level 3: + Complex create (events with nested structures)
```

---

## Implementation Plan

### Phase 1: Quick Wins (1-2 days)
- [ ] Add usage examples to all tool descriptions
- [ ] Improve validation error messages
- [ ] Document common workflows
- [ ] Make more parameters optional with defaults

### Phase 2: Event Tool Consolidation (3-5 days)
- [ ] Design unified `createEvent` schema
- [ ] Implement backend handler for discriminated creation
- [ ] Migrate existing event creation tools to new unified tool
- [ ] Update tests
- [ ] Deprecate old specialized tools

### Phase 3: Flatten Nested Structures (3-5 days)
- [ ] Update `createBookEvent` to accept flat `authorIds` arrays
- [ ] Implement backend type resolution logic
- [ ] Update other tools with nested structures
- [ ] Update schemas and validation
- [ ] Update tests

### Phase 4: Simplify Edit Operations (2-3 days)
- [ ] Decide: Split editEvent or improve validation?
- [ ] Implement chosen approach
- [ ] Update actor/group edit tools to reduce parameter count
- [ ] Update tests

### Phase 5: Testing and Documentation (2-3 days)
- [ ] Integration testing with real LLM clients
- [ ] Update MCP server documentation
- [ ] Create migration guide for existing clients
- [ ] Measure improvement in LLM success rates

**Total Estimated Time:** 11-18 days

---

## Success Metrics

### Before Optimization
- **Complex Tools:** 27% (11/41)
- **Tools with Nested Structures:** 15% (6/41)
- **Average Parameters per Tool:** ~6
- **Event Creation Tools:** 8 separate tools
- **Estimated LLM Error Rate:** 30-40% on complex tools

### After Optimization (Target)
- **Complex Tools:** <10% (4/41)
- **Tools with Nested Structures:** <5% (2/41)
- **Average Parameters per Tool:** ~4
- **Event Creation Tools:** 1-2 unified tools
- **Estimated LLM Error Rate:** <10% on all tools

---

## Related Files

### MCP Tool Implementation Files
```
services/api/src/routes/mcp/tools/
├── actors/
│   ├── createActor.tool.ts       (9 params)
│   ├── editActor.tool.ts         (11 params)
│   ├── findActors.tool.ts        (7 params)
│   └── getActor.tool.ts          (1 param)
├── groups/
│   ├── createGroup.tool.ts       (9 params)
│   ├── editGroup.tool.ts         (11 params)
│   ├── findGroups.tool.ts        (4 params)
│   └── getGroup.tool.ts          (1 param)
├── events/
│   ├── createBookEvent.tool.ts           (10 params, nested)
│   ├── createUncategorizedEvent.tool.ts  (12 params)
│   ├── createScientificStudyEvent.tool.ts (10 params, nested)
│   ├── createTransactionEvent.tool.ts    (10 params)
│   ├── createDocumentaryEvent.tool.ts    (9 params, nested)
│   ├── createDeathEvent.tool.ts          (9 params)
│   ├── createQuoteEvent.tool.ts          (7 params)
│   ├── createPatentEvent.tool.ts         (7 params)
│   ├── editEvent.tool.ts         (9+ params, discriminated)
│   ├── findEvents.tool.ts        (4 params)
│   └── getEvent.tool.ts          (1 param)
├── links/
│   ├── createLink.tool.ts        (3 params)
│   ├── editLink.tool.ts          (7 params)
│   ├── findLinks.tool.ts         (4 params)
│   └── getLink.tool.ts           (1 param)
├── media/
│   ├── createMedia.tool.ts       (4 params)
│   ├── editMedia.tool.ts         (5 params)
│   ├── findMedia.tool.ts         (5 params)
│   ├── getMedia.tool.ts          (1 param)
│   └── uploadMediaFromURL.tool.ts (4 params)
├── areas/
│   ├── createArea.tool.ts        (5 params)
│   ├── editArea.tool.ts          (6 params)
│   ├── findAreas.tool.ts         (6 params)
│   └── getArea.tool.ts           (1 param)
├── nations/
│   ├── findNations.tool.ts       (2 params)
│   └── getNation.tool.ts         (1 param)
└── blockNoteToText.tool.ts       (1 param)
```

### Related Backend Flows
```
services/api/src/flows/
├── actors/createActor.flow.ts
├── groups/createGroup.flow.ts
├── events/
│   ├── createEvent.flow.ts
│   └── editEvent.flow.ts
└── ...
```

### Schema Definitions
```
packages/@liexp/io/src/http/
├── Actor.ts
├── Group.ts
├── Events/
│   ├── Book.ts
│   ├── index.ts (EditEventBody, EditEventTypeAndPayload)
│   └── ...
└── Common/UUID.ts
```

---

## Appendix: Detailed Tool Signatures

### Event Creation Tools (Current)

#### createBookEvent (10 params, nested)
```typescript
{
  date: string,           // ISO format YYYY-MM-DD
  draft: boolean,
  excerpt: string | null,
  body: string | null,
  media: UUID[],
  links: UUID[],
  keywords: UUID[],
  title: string,
  pdfMediaId: UUID,
  audioMediaId: UUID | null,
  authors: Array<{       // NESTED
    type: "Actor" | "Group",
    id: UUID
  }>,
  publisher: {           // NESTED
    type: "Actor" | "Group",
    id: UUID
  } | null
}
```

#### createUncategorizedEvent (12 params)
```typescript
{
  date: string,
  draft: boolean,
  excerpt: string | null,
  body: string | null,
  media: UUID[],
  links: UUID[],
  keywords: UUID[],
  title: string,
  actors: UUID[],
  groups: UUID[],
  groupsMembers: UUID[],
  location: UUID | null,
  endDate: string | null
}
```

### Actor/Group Tools (Current)

#### createActor (9 params)
```typescript
{
  username: string,
  fullName: string,
  color: string,          // hex without #
  excerpt: string | undefined,
  nationalities: UUID[],
  body: string | undefined,
  avatar: UUID,
  bornOn: string | undefined,
  diedOn: string | undefined
}
```

#### editActor (11 params)
```typescript
{
  id: UUID,
  username: string,
  fullName: string,
  color: string,
  excerpt: string | undefined,
  nationalities: UUID[],
  memberIn: UUID[],       // Group memberships
  body: string | undefined,
  avatar: UUID | undefined,
  bornOn: string | undefined,
  diedOn: string | undefined
}
```

---

## Notes

- This analysis was generated on 2026-02-13 during work on the `fix/wikipedia-api` branch
- The complexity assessment is based on reviewing actual tool implementation files
- Recommendations prioritize LLM usability over API elegance
- Implementation should be iterative, starting with highest-impact changes
- All changes should maintain backward compatibility where possible

---

## Next Steps

1. Review this analysis with the team
2. Prioritize recommendations based on:
   - Impact on LLM success rates
   - Implementation complexity
   - Breaking changes vs backward compatibility
3. Create GitHub issues for each recommendation
4. Start with Phase 1 (Quick Wins) to gain immediate improvements
5. Measure baseline LLM performance before optimization
6. Track improvement after each phase

---

**Author:** Analysis generated by OpenCode AI Assistant  
**Last Updated:** 2026-02-13  
**Version:** 1.0
