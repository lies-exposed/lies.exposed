# Phase 2: Event Tool Consolidation - Implementation Plan

## Current State Analysis

### 8 Separate Event Creation Tools
1. `createBookEvent` - 10 params with nested authors/publisher
2. `createUncategorizedEvent` - 12 params
3. `createScientificStudyEvent` - 10 params with nested authors
4. `createTransactionEvent` - 10 params with nested from/to
5. `createDocumentaryEvent` - 9 params with nested authors
6. `createDeathEvent` - 9 params
7. `createQuoteEvent` - 7 params
8. `createPatentEvent` - 7 params

### Common Pattern
All tools share:
- 7 base event fields: `date, draft, excerpt, body, media, links, keywords`
- 1 type discriminator
- 2-5 type-specific fields

### Existing EditEventTypeAndPayload Pattern
Already using discriminated unions:
```typescript
EditEventTypeAndPayload = Union of:
- { type: "Book", payload: BookPayload }
- { type: "Death", payload: DeathPayload }
- { type: "Patent", payload: PatentPayload }
- { type: "ScientificStudy", payload: ScientificStudyPayload }
- { type: "Uncategorized", payload: UncategorizedV2Payload }
- { type: "Documentary", payload: DocumentaryPayload }
- { type: "Transaction", payload: TransactionPayload }
- { type: "Quote", payload: QuotePayload }
```

## Phase 2 Goals

### Primary Goal
Consolidate 8 event creation tools → 1-2 unified tools

### Benefits
- Single tool signature instead of 8 different ones
- LLMs learn one pattern instead of eight
- Easier to maintain and update
- Consistent error messages across all event types
- Reduce cognitive load by ~87% (8→1)

## Implementation Strategy

### Option A: Single Unified createEvent Tool (RECOMMENDED)

**Schema Design:**
```typescript
CreateEventInputSchema = {
  type: EventType (discriminator)
  
  // Common base fields
  date: string (ISO YYYY-MM-DD)
  draft: boolean
  excerpt: string | null
  body: string | null
  media: UUID[]
  links: UUID[]
  keywords: UUID[]
  
  // Type-specific payload (discriminated union)
  payload: Union of:
    - BookPayload { title, pdfMediaId, audioMediaId, authors, publisher }
    - DeathPayload { victim, location, causes }
    - PatentPayload { title, owners, source }
    - ScientificStudyPayload { title, url, image, authors, publisher }
    - UncategorizedPayload { actors, groups, groupsMembers, location, endDate }
    - DocumentaryPayload { title, website, authors, subjects }
    - TransactionPayload { title, total, currency, from, to }
    - QuotePayload { quote, actor, subject, details }
}
```

**Key Advantages:**
- Follows existing EditEventTypeAndPayload pattern
- Single tool to learn
- Payload structure is already defined for each event type
- Can support all event types in one tool

**Example Usage:**
```json
// Book event
{
  "type": "Book",
  "date": "2024-01-15",
  "draft": false,
  "title": "The Great Book",
  "payload": {
    "title": "The Great Book",
    "pdfMediaId": "media-uuid",
    "authors": [{"type": "Actor", "id": "uuid"}],
    "publisher": null
  }
}

// Transaction event
{
  "type": "Transaction",
  "date": "2024-02-20",
  "draft": false,
  "payload": {
    "title": "Payment",
    "total": 1500000,
    "currency": "USD",
    "from": {"type": "Group", "id": "company-a-uuid"},
    "to": {"type": "Group", "id": "company-b-uuid"}
  }
}
```

### Option B: Two Specialized Tools

**createSimpleEvent** for basic types (Quote, Patent)
- Lower parameter count (~7-8)
- For types without nested objects

**createComplexEvent** for advanced types (Book, Transaction, etc.)
- Higher parameter count (~10-12)
- For types with nested structures

**Drawback:** Still requires LLMs to choose between 2 tools

## Implementation Steps

### Step 1: Create Unified Schema
- [ ] Design `CreateUnifiedEventInputSchema` with discriminated union
- [ ] Base on existing `EditEventTypeAndPayload` pattern
- [ ] Include all 8 event type payloads

### Step 2: Implement Unified Tool Handler
- [ ] Create `createEvent.tool.ts` handler
- [ ] Implement type-specific payload routing
- [ ] Add comprehensive error handling for each type
- [ ] Update tool description with workflow

### Step 3: Register Unified Tool
- [ ] Add to `event.tools.ts` registration
- [ ] Mark original 8 tools as deprecated (with migration guide)
- [ ] Update tool descriptions to recommend unified tool

### Step 4: Update Tool Descriptions
- [ ] Add migration guide for LLMs
- [ ] Show examples for each event type
- [ ] Include type selection guidance

### Step 5: Backward Compatibility
- [ ] Keep original 8 tools functional (legacy support)
- [ ] Deprecation warnings in tool descriptions
- [ ] Migration path for existing integrations

### Step 6: Testing
- [ ] Unit tests for type discrimination
- [ ] E2E tests for each event type through unified tool
- [ ] Verify parameter count reduction
- [ ] Error handling tests

## Expected Outcomes

### Complexity Reduction
- **Before:** 8 tools, avg 9.5 params each = 76 total params
- **After:** 1 tool, 11 params (7 common + 1 type + 1 payload + 2 meta) = 11 params
- **Reduction:** 85.5% parameter count reduction

### LLM Usability Improvement
- Learn 1 tool signature instead of 8
- Type-discriminated payload is same pattern as editEvent
- Consistency with existing patterns
- Easier tool choice (no selection paralysis)

### Code Maintenance
- Centralized event creation logic
- Shared payload validation
- Single point of error handling
- Easier feature additions

## Migration Path for Agents

### Phase 2A (Current Branch)
- Unified tool available alongside 8 specialized tools
- Both sets functional (no breaking changes)
- Migration guide in tool descriptions

### Phase 2B (Future)
- Mark specialized tools as deprecated
- Strong recommendation to use unified tool
- Support deprecation period (1-2 months)

### Phase 2C (Future)
- Remove deprecated specialized tools
- Only unified tool available
- Agents adapted to use unified tool

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| LLM confusion with discriminated unions | Provide clear workflow examples & type selection guide |
| Breaking existing integrations | Keep specialized tools as legacy support |
| Implementation complexity | Base design on existing EditEventTypeAndPayload |
| Test coverage gaps | Comprehensive E2E tests for each type |
| Schema validation errors | Clear error messages per type & field |

## Success Metrics

1. **Tool Consolidation:**
   - 8 specialized tools → 1 unified tool (with legacy support)
   - Single tool signature to learn
   - 85% reduction in parameter count

2. **LLM Performance:**
   - Fewer tool selection errors (less paralysis)
   - Consistent payload structure understanding
   - Reduced confusion with nested objects

3. **Developer Experience:**
   - Centralized event creation logic
   - Easier maintenance and updates
   - Consistent error handling

## Timeline Estimate

- **Analysis & Design:** 1 day (today)
- **Implementation:** 2 days
- **Testing & Refinement:** 1 day
- **Documentation & Deprecation Guide:** 1 day

**Total: 3-5 days (as planned)**

## Files to Modify/Create

### New Files
- `services/api/src/routes/mcp/tools/events/createEvent.tool.ts` - Unified tool

### Modified Files
- `services/api/src/routes/mcp/tools/events/event.tools.ts` - Registration
- `packages/@liexp/io/src/http/Events/index.ts` - Export CreateEventTypeAndPayload (if needed)

### Preserved Files (for legacy)
- 8 existing create tools (kept functional but deprecated)

## Next Steps

1. ✅ Analyzed 8 event types and patterns
2. ✅ Identified EditEventTypeAndPayload as reference pattern
3. → Create unified schema interface
4. → Implement handler with type routing
5. → Add comprehensive testing
6. → Update documentation

---

## Detailed Payload Reference

For implementation, here are all 8 event type payload structures:

### 1. BookPayload
- title: string
- pdfMediaId: UUID
- audioMediaId?: UUID
- authors: Array<{type: "Actor"|"Group", id: UUID}>
- publisher?: {type: "Actor"|"Group", id: UUID}

### 2. DeathPayload
- victim: UUID (actor ID)
- location?: UUID (area ID)
- causes?: UUID[]

### 3. PatentPayload
- title: string
- owners: Array<{type: "Actor"|"Group", id: UUID}>
- source: string

### 4. ScientificStudyPayload
- title: string
- url: string
- image?: UUID
- authors: Array<{type: "Actor"|"Group", id: UUID}>
- publisher?: {type: "Actor"|"Group", id: UUID}

### 5. UnategorizedPayload
- title: string
- actors: UUID[]
- groups: UUID[]
- groupsMembers: UUID[]
- location?: UUID
- endDate?: Date

### 6. DocumentaryPayload
- title: string
- website: string
- authors: Array<{type: "Actor"|"Group", id: UUID}>
- subjects: Array<{type: "Actor"|"Group", id: UUID}>

### 7. TransactionPayload
- title: string
- total: number
- currency: string (ISO code)
- from: {type: "Actor"|"Group", id: UUID}
- to: {type: "Actor"|"Group", id: UUID}

### 8. QuotePayload
- quote: string
- actor?: UUID
- subject?: {type: "Actor"|"Group", id: UUID}
- details?: string

---

## Decision Record

**Decision:** Implement Option A - Single Unified createEvent Tool

**Reasoning:**
1. ✅ Already proven pattern with EditEventTypeAndPayload
2. ✅ Maximum complexity reduction (8→1)
3. ✅ No breaking changes (keep legacy tools)
4. ✅ Consistent with existing API design
5. ✅ Lower maintenance burden going forward
6. ✅ Easier for LLMs to learn and use one pattern

**Trade-offs Accepted:**
- Slightly more complex discriminated union structure
- Need clear documentation for type selection
- Requires comprehensive error messages per type

**Benefits:**
- 85%+ parameter reduction
- Single tool to learn
- Easier to extend with new event types
- Consistent error handling

---

*Last Updated: 2026-02-14*
*Status: Ready for Implementation*
