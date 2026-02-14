# MCP Tools - Implementation Guide

**Last Updated:** February 14, 2026  
**Tools:** 41 across 8 categories  
**Test Coverage:** 446 tests passing

---

## Overview

The MCP tools expose the lies.exposed database operations through a standardized interface optimized for LLM agent usage. This guide describes the current implementation choices and best practices.

**Tool Summary:**
- **41 total tools** across 8 categories (Actors, Groups, Events, Links, Media, Areas, Nations, Utilities)
- **Low cognitive load:** Consistent patterns across all categories
- **Search-first workflow:** Always find before creating to avoid duplicates
- **Minimal required parameters:** Optional fields keep existing values when omitted

---

## Tool Design Patterns

### Pattern 1: Simple CRUD Operations (10 tools)

Get operations for single entity retrieval.

**Signature:** `getEntity(id: UUID) → Entity`

**Examples:** `getActor`, `getGroup`, `getEvent`, `getLink`, `getMedia`, `getArea`, `getNation`

**Usage:**
```typescript
getActor("550e8400-e29b-41d4-a716-446655440000")
// Returns: { id, username, fullName, description, ... }
```

**When to use:**
- Retrieve a single entity by ID
- Refresh entity data
- Display full entity details

---

### Pattern 2: Search/Find Operations (14 tools)

Find operations for searching with optional filters.

**Signature:** `findEntity(filters?) → Entity[]`

**Examples:** `findActors`, `findGroups`, `findEvents`, `findLinks`, `findMedia`, `findAreas`

**Features:**
- 4-7 optional parameters with sensible defaults
- Flat parameter structure (no nested objects)
- Returns paginated results
- Always search before creating to avoid duplicates

**Example: Find Actors**
```typescript
findActors({
  fullName?: string,           // Search by name
  memberIn?: UUID[],          // Filter by group membership
  sort?: "fullName" | "createdAt",
  order?: "ASC" | "DESC",
  start?: number,             // Pagination start
  end?: number                // Pagination end
})
// Returns: { actors: Entity[], total: number }
```

**Critical tip:** Search with multiple name variations before creating new entities. Names can have:
- Different languages (John vs Juan)
- Initials vs full names (J.K. vs Jane Katherine)
- Alternative spellings
- Historical name changes

---

### Pattern 3: Event Creation - Unified Tool

Single tool for creating all event types using a type discriminator.

**Signature:** `createEvent(params) → Event`

**Supported Event Types:**
- `Book` - Book publication events
- `Quote` - Public statements or quotes
- `Patent` - Patent filings
- `Death` - Death events
- `Documentary` - Documentary releases
- `ScientificStudy` - Research publications
- `Transaction` - Financial/business transactions
- `Uncategorized` - Generic events

**Implementation:**
```typescript
createEvent({
  type: "Book" | "Quote" | "Death" | "Patent" | ...,
  date: "YYYY-MM-DD",
  title?: string,
  description?: string,
  
  // Type-specific payload (structure varies by type)
  payload: {
    // For Book events:
    authors?: Array<{ type: "Actor", id: UUID }>,
    publisher?: { type: "Group", id: UUID },
    pdfMediaId?: UUID,
    
    // For other types: different fields apply
  },
  
  links?: UUID[],              // Related links
  mediaIds?: UUID[],           // Attached media
  keywords?: string[],         // Topic keywords
})
```

**Why unified?** Single tool signature that handles all event types - LLMs learn one pattern instead of eight specialized tools. Old specialized tools still available for backward compatibility.

---

### Pattern 4: Actor & Group Creation

Create new actors (people) and groups (organizations).

**Signature:** `createActor(params) → Actor` or `createGroup(params) → Group`

**Actor Creation:**
```typescript
createActor({
  username: string,            // Unique identifier
  fullName: string,            // Display name
  config?: {
    color?: string,            // Auto-generated if omitted
    excerpt?: string,          // Short bio
    nationalities?: UUID[],    // Country references
    birthDate?: "YYYY-MM-DD",
    deathDate?: "YYYY-MM-DD",
    // ... other optional fields
  }
})
```

**Group Creation:**
```typescript
createGroup({
  username: string,            // Unique identifier
  name: string,                // Display name
  config?: {
    color?: string,            // Auto-generated if omitted
    excerpt?: string,          // Short description
    founded?: "YYYY-MM-DD",
    disbanded?: "YYYY-MM-DD",
    // ... other optional fields
  }
})
```

**Best Practice:** Search first to avoid creating duplicates
```
1. findActors(fullName)  → Check if already exists
2. If not found: createActor(username, fullName, config)
3. Proceed with the actor's UUID
```

---

### Pattern 5: Link & Media Creation

Create references to external content.

**Create Link:**
```typescript
createLink({
  url: string,                 // Web address
  title?: string,              // Display title
  description?: string,        // Content summary
  publishDate?: "YYYY-MM-DD",  // Publication date
})
```

**Upload Media:**
```typescript
uploadMediaFromURL({
  url: string,                 // Source URL
  mediaType?: "Image" | "Video" | "Document" | "Audio",
  // Optional processing:
  width?: number,
  height?: number,
  duration?: number,           // For video/audio
})
```

---

### Pattern 6: Area Creation

Create geographical entities.

**Create Area:**
```typescript
createArea({
  name: string,                // Area name
  areaType?: "Country" | "Region" | "City",
  config?: {
    color?: string,            // Auto-generated if omitted
    // ... other optional fields
  }
})
```

---

### Pattern 7: EDIT Operations - Standardized (6 tools)

Update any entity by providing only the fields to change.

**Signature:** `editEntity(id, updates?) → Entity`

**Tools:** `editActor`, `editGroup`, `editLink`, `editArea`, `editMedia`, `editEvent`

**Key characteristic:** Only `id` is required. All other fields are optional.

**How it works:**
```typescript
editActor({
  id: UUID,                    // Required: which actor to update
  
  // Optional: provide only fields to change
  fullName?: string,
  description?: string,
  excerpt?: string,
  // ... other optional fields
  
  // Omitted fields keep their current values
})
```

**Behavior:**
- Omitted fields: Keep existing values
- Provided fields: Updated with new values
- Partial updates: Supported (no need to provide all fields)

**Example:**
```typescript
// Only update the name, everything else stays the same
editActor({
  id: "550e8400-e29b-41d4-a716-446655440000",
  fullName: "New Name"
})
```

**For Events (type-specific):**
```typescript
editEvent({
  id: UUID,
  
  // Common fields
  title?: string,
  description?: string,
  
  // Type-specific payload (if changing type)
  type?: "Book" | "Quote" | ...,
  payload?: TypeSpecificPayload,
  
  // References
  links?: UUID[],
  mediaIds?: UUID[],
  keywords?: string[],
})
```

---

## Common Workflows

### Workflow 1: Search Before Create

Always search first to avoid duplicates:

```
1. Use findActors(fullName) to search for existing entity
2. Check results for matches
3. If found: Use existing UUID
4. If not found: createActor(username, fullName, config)
```

**Why?** Duplicates cause:
- Fragmented data across multiple records
- Broken relationships
- Confusing search results
- Increased cleanup work

### Workflow 2: Create Complex Objects

Build complex objects from smaller components:

```
1. uploadMediaFromURL(url) → { mediaId: UUID }
2. findActors(author_name) → { id: UUID, ... }
3. findGroups(publisher_name) → { id: UUID, ... }
4. createEvent({
     type: "Book",
     date: "2024-01-15",
     payload: {
       authors: [{ type: "Actor", id: author_uuid }],
       publisher: { type: "Group", id: publisher_uuid },
       pdfMediaId: media_uuid
     },
     mediaIds: [media_uuid]
   })
```

**Key:** Gather all UUIDs first, then create the event.

### Workflow 3: Update Existing Entity

Efficiently update one or more fields:

```
1. findActors(name) → Get the actor
2. editActor({
     id: actor_id,
     fullName: "Updated Name",  // Only change this
     // Other fields omitted - they keep current values
   })
```

---

## API Contracts

### Required vs Optional by Tool Type

| Tool Type | Required | Optional |
|-----------|----------|----------|
| **GET** (getActor) | `id` | None |
| **FIND** (findActors) | None | All filters |
| **CREATE** (createActor) | `username`, `fullName` | `config.*` |
| **EDIT** (editActor) | `id` | All fields |
| **CREATE Event** | `type`, `date` | `payload.*`, others |

### Date Format

All dates use ISO 8601: `YYYY-MM-DD`

```typescript
// Correct
"2024-01-15"
"1950-06-23"

// Incorrect
"01/15/2024"
"23-06-1950"
"2024-01-15T00:00:00Z"  // Exclude time component
```

### UUID Format

All IDs are UUIDs (RFC 4122):

```typescript
// Correct
"550e8400-e29b-41d4-a716-446655440000"

// Incorrect
"550e8400e29b41d4a716446655440000"  // Missing hyphens
"actor:abc123"                       // Wrong format
```

### Response Format

All tools return structured responses:

```typescript
{
  // For single entity operations
  id: UUID,
  username: string,
  fullName: string,
  createdAt: ISO8601DateTime,
  updatedAt: ISO8601DateTime,
  // ... type-specific fields
  
  // For list operations
  data: Entity[],
  total: number,
  start: number,
  end: number
}
```

---

## Tool Categories

### Actors (4 tools)
- **getActor** - Retrieve by ID
- **findActors** - Search with filters
- **createActor** - Create new person
- **editActor** - Update person details

### Groups (4 tools)
- **getGroup** - Retrieve by ID
- **findGroups** - Search with filters
- **createGroup** - Create new organization
- **editGroup** - Update organization details

### Events (11 tools)
- **getEvent** - Retrieve by ID
- **findEvents** - Search with filters
- **createEvent** - Create any event type (unified)
- **editEvent** - Update event details
- **createBookEvent** - Deprecated (use createEvent)
- **createQuoteEvent** - Deprecated (use createEvent)
- **createPatentEvent** - Deprecated (use createEvent)
- **createDeathEvent** - Deprecated (use createEvent)
- **createDocumentaryEvent** - Deprecated (use createEvent)
- **createScientificStudyEvent** - Deprecated (use createEvent)
- **createTransactionEvent** - Deprecated (use createEvent)

### Links (4 tools)
- **getLink** - Retrieve by ID
- **findLinks** - Search with filters
- **createLink** - Create web reference
- **editLink** - Update link details

### Media (5 tools)
- **getMedia** - Retrieve by ID
- **findMedia** - Search with filters
- **uploadMediaFromURL** - Create from web source
- **uploadMediaFromFile** - Create from file upload
- **editMedia** - Update media details

### Areas (4 tools)
- **getArea** - Retrieve by ID
- **findAreas** - Search with filters
- **createArea** - Create geographical area
- **editArea** - Update area details

### Nations (2 tools)
- **getNation** - Retrieve by ID
- **findNations** - Search with filters

### Utilities (1 tool)
- **formatMarkdown** - Format text for display

---

## Implementation Examples

### Example 1: Create a Book Event with Author

```typescript
// Step 1: Find or create author
const authors = findActors({ fullName: "Jane Smith" });
let authorId;

if (authors.actors.length > 0) {
  authorId = authors.actors[0].id;
} else {
  const newAuthor = createActor({
    username: "jane_smith",
    fullName: "Jane Smith"
  });
  authorId = newAuthor.id;
}

// Step 2: Upload book cover/PDF
const media = uploadMediaFromURL({
  url: "https://example.com/book.pdf",
  mediaType: "Document"
});

// Step 3: Create event
const event = createEvent({
  type: "Book",
  date: "2024-01-15",
  title: "The Great Work",
  description: "A remarkable contribution to the field",
  payload: {
    authors: [{ type: "Actor", id: authorId }],
    // publisher, publicationDate, etc.
  },
  mediaIds: [media.id],
  keywords: ["literature", "philosophy"]
});
```

### Example 2: Update Actor Information

```typescript
// Find the actor
const results = findActors({ fullName: "John Doe" });
const actor = results.actors[0];

// Update only necessary fields
const updated = editActor({
  id: actor.id,
  description: "Updated biography",
  excerpt: "Short summary"
  // All other fields remain unchanged
});
```

### Example 3: Create Event with Multiple Participants

```typescript
// Gather all participants
const authors = findActors({ fullName: "Alice Johnson" });
const publishers = findGroups({ name: "Academic Press" });

// Create event
const event = createEvent({
  type: "ScientificStudy",
  date: "2024-02-20",
  title: "Novel Research Findings",
  payload: {
    authors: authors.actors.map(a => ({ type: "Actor", id: a.id })),
    publisher: publishers.groups.length > 0 
      ? { type: "Group", id: publishers.groups[0].id }
      : undefined,
    publicationYear: 2024
  }
});
```

---

## Error Handling

### Validation Errors

Common validation issues and solutions:

**Invalid Date Format**
```
Error: "Invalid date format"
Solution: Use YYYY-MM-DD format
```

**UUID Not Found**
```
Error: "Actor with id {id} not found"
Solution: Verify the ID exists using get{Entity}(id)
```

**Duplicate Entity**
```
Error: "Username already exists"
Solution: Check if entity already created, search first
```

**Validation on Create**
```
Error: "Field 'fullName' is required"
Solution: Check tool documentation for required fields
```

### Best Practice: Verify Before Using

```typescript
// Always verify relationships exist
const actor = getActor(actor_id);  // Throws if not found
const media = getMedia(media_id);  // Throws if not found

// Then create event with verified IDs
createEvent({
  // Safe: we verified these exist
  payload: {
    authors: [{ type: "Actor", id: actor.id }]
  },
  mediaIds: [media.id]
});
```

---

## Performance Considerations

### Pagination in Search Operations

For large datasets, use `start` and `end` parameters:

```typescript
// Get first 10 results
findActors({
  fullName: "John",
  start: 0,
  end: 10
})

// Get next 10 results (results 11-20)
findActors({
  fullName: "John",
  start: 10,
  end: 20
})
```

### Efficient Workflows

**Good:** Batch operations together
```typescript
// Search once for all needed entities
const actors = findActors({ fullName });
const groups = findGroups({ name });
const media = uploadMediaFromURL({ url });

// Then create event with all gathered IDs
createEvent({ /* ... */ });
```

**Avoid:** Multiple searches for same entity
```typescript
// Don't do this repeatedly:
findActors({ fullName });  // Call 1
findActors({ fullName });  // Call 2 (duplicate)
```

---

## Integration with Agent Systems

### Tool Availability

All 41 tools are available to agents by default.

### Recommended Tool Order (by frequency)

1. **findActors** - Most used for searching
2. **findGroups** - Searching organizations
3. **findEvents** - Searching events
4. **createEvent** - Creating events
5. **editActor** - Updating entities
6. **editEvent** - Updating events

### Decision-Making by Agents

Tools support the workflow:
1. **Search** (find*) - Locate existing entities
2. **Create** (create*) - Add new entities
3. **Edit** (edit*) - Update existing entities
4. **Read** (get*) - Retrieve full details

---

## Testing & Validation

### Test Coverage

- **129 test files** across all tool categories
- **446 tests** validating tool functionality
- **0 failures** - all tests passing
- **Full backward compatibility** maintained

### Tested Scenarios

- ✅ CRUD operations
- ✅ Search with filters
- ✅ Event type discrimination
- ✅ Partial updates (EDIT operations)
- ✅ Validation errors
- ✅ UUID resolution
- ✅ Date format handling
- ✅ MCP protocol compliance

---

## Backward Compatibility

**Full backward compatibility maintained:**

- All 8 specialized event creation tools (createBookEvent, etc.) still available
- All old API contracts unchanged
- New code should use `createEvent` (unified)
- Old code using specialized tools continues to work

**Migration path for legacy code:**
```typescript
// Old way (still works)
const event = createBookEvent({
  title: "...",
  // ...
});

// New way (preferred)
const event = createEvent({
  type: "Book",
  // ...
});
```

---

## Related Documentation

### Tool Category Guides
- See specific category documentation for detailed tool parameters
- Each category has dedicated reference documentation

### Complexity Analysis
- **Original Analysis:** `mcp-tools-complexity-analysis.md`

### Source Code
```
services/api/src/routes/mcp/tools/
├── actors/
├── groups/
├── events/
├── links/
├── media/
├── areas/
├── nations/
└── utils/
```

---

## Quick Reference

### Most Used Tools

| Tool | Purpose | Usage |
|------|---------|-------|
| **findActors** | Search for people | `findActors({ fullName })` |
| **findGroups** | Search for organizations | `findGroups({ name })` |
| **findEvents** | Search for events | `findEvents({ title })` |
| **createEvent** | Create any event type | `createEvent({ type, date, payload })` |
| **editActor** | Update person details | `editActor({ id, field })` |
| **editEvent** | Update event details | `editEvent({ id, field })` |

### Critical Patterns

| Pattern | Example |
|---------|---------|
| **Search first** | `findActors()` → check results before `createActor()` |
| **Unified events** | Use `createEvent()` with `type` discriminator |
| **Partial updates** | Only provide fields to change in `edit*()` calls |
| **Gather references** | Collect all UUIDs before creating complex objects |

---

## Summary

The MCP tools provide a clear, consistent interface to the lies.exposed database. Key principles:

1. **Search first** - Always find before creating to avoid duplicates
2. **Unified patterns** - All tools follow consistent signatures
3. **Minimal required parameters** - Only provide what's needed
4. **Backward compatible** - Old code continues to work
5. **Well-tested** - 446 tests validating all operations

Use these tools to build fact-checking applications and information analysis systems.
