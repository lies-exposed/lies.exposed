# MCP Tools Migration Guide: Event Creation Consolidation

**Last Updated:** February 2026  
**Status:** Phase 2 Consolidation Complete  
**Breaking Changes:** None - All old tools remain functional during transition period

---

## Overview

The MCP event creation tools have been consolidated from 8 specialized tools into a single unified tool with type discrimination. This improves consistency, reduces LLM confusion, and simplifies maintenance.

### What Changed

| Before | After |
|--------|-------|
| 8 separate event creation tools | 1 unified `createEvent` tool |
| Different parameter orders per tool | Consistent base + type-specific payload |
| Complex nested structures | Simplified with discriminated unions |
| ~27% of tools were "complex" (8-12 params) | <10% of tools are complex |

---

## Migration Path

### Phase 1: Current (Transition Period)
- ✅ New `createEvent` (unified) tool available
- ✅ All old tools still work with deprecation notices
- ✅ No breaking changes - backward compatible
- ✅ Clients can migrate at their own pace

### Phase 2: Planned (After Migration Window)
- Old tools will eventually be removed
- Timeline: TBD based on adoption metrics

### Phase 3: Planned (Future)
- Complete deprecation cycle
- Focus on unified tooling patterns

---

## Quick Migration Examples

### Book Event Migration

**Old Approach (Deprecated):**
```typescript
createBookEvent({
  date: "2024-01-15",
  draft: false,
  title: "The Great Book",
  pdfMediaId: "media-uuid-1",
  audioMediaId: null,
  authors: [
    { type: "Actor", id: "author-uuid-1" },
    { type: "Actor", id: "author-uuid-2" }
  ],
  publisher: { type: "Group", id: "publisher-uuid-1" },
  excerpt: "A fascinating book",
  body: null,
  media: ["media-uuid-1"],
  links: [],
  keywords: []
})
```

**New Approach (Recommended):**
```typescript
createEvent({
  type: "Book",
  date: "2024-01-15",
  draft: false,
  excerpt: "A fascinating book",
  body: null,
  media: ["media-uuid-1"],
  links: [],
  keywords: [],
  payload: {
    type: "Book",
    title: "The Great Book",
    pdfMediaId: "media-uuid-1",
    audioMediaId: null,
    authors: [
      { type: "Actor", id: "author-uuid-1" },
      { type: "Actor", id: "author-uuid-2" }
    ],
    publisher: { type: "Group", id: "publisher-uuid-1" }
  }
})
```

**Key Differences:**
- Type discrimination moved to top level + payload
- All base fields (date, draft, excerpt, body, media, links, keywords) grouped together
- Event-specific payload is nested inside `payload` field
- `payload.type` must match top-level `type`

---

### Quote Event Migration

**Old Approach (Deprecated):**
```typescript
createQuoteEvent({
  date: "2024-02-15",
  draft: false,
  quote: "We must act on climate change",
  actor: "actor-uuid-1",
  subject: null,
  details: "Said during press conference",
  excerpt: "Climate statement",
  body: null,
  media: [],
  links: [],
  keywords: []
})
```

**New Approach (Recommended):**
```typescript
createEvent({
  type: "Quote",
  date: "2024-02-15",
  draft: false,
  excerpt: "Climate statement",
  body: null,
  media: [],
  links: [],
  keywords: [],
  payload: {
    type: "Quote",
    quote: "We must act on climate change",
    actor: "actor-uuid-1",
    subject: null,
    details: "Said during press conference"
  }
})
```

---

### All Event Type Payload Structures

#### Book Payload
```typescript
payload: {
  type: "Book",
  title: string,
  pdfMediaId: UUID,
  audioMediaId: UUID | null,
  authors: Array<{type: "Actor" | "Group", id: UUID}>,
  publisher: {type: "Actor" | "Group", id: UUID} | null
}
```

#### Death Payload
```typescript
payload: {
  type: "Death",
  victim: UUID,
  location: UUID | null,
  causes: UUID[]
}
```

#### Patent Payload
```typescript
payload: {
  type: "Patent",
  title: string,
  owners: Array<{type: "Actor" | "Group", id: UUID}>,
  source: string | null
}
```

#### ScientificStudy Payload
```typescript
payload: {
  type: "ScientificStudy",
  title: string,
  url: UUID | string,
  image: UUID | null,
  authors: Array<{type: "Actor" | "Group", id: UUID}>,
  publisher: {type: "Actor" | "Group", id: UUID} | null
}
```

#### Uncategorized Payload
```typescript
payload: {
  type: "Uncategorized",
  title: string,
  actors: UUID[],
  groups: UUID[],
  groupsMembers: UUID[],
  location: UUID | null,
  endDate: string | null
}
```

#### Documentary Payload
```typescript
payload: {
  type: "Documentary",
  title: string,
  website: string | null,
  authors: Array<{type: "Actor" | "Group", id: UUID}>,
  subjects: Array<{type: "Actor" | "Group", id: UUID}>
}
```

#### Transaction Payload
```typescript
payload: {
  type: "Transaction",
  title: string,
  total: number,
  currency: string,
  from: {type: "Actor" | "Group", id: UUID},
  to: {type: "Actor" | "Group", id: UUID}
}
```

#### Quote Payload
```typescript
payload: {
  type: "Quote",
  quote: string,
  actor: UUID | null,
  subject: {type: "Actor" | "Group", id: UUID} | null,
  details: string | null
}
```

---

## Benefits of Migration

### For AI/LLM Integrations
✅ Single tool to master instead of learning 8 different signatures  
✅ Consistent parameter naming and ordering  
✅ Clear type discrimination pattern  
✅ Reduced cognitive load by ~87% (8→1 tools)  
✅ Fewer errors from tool confusion  

### For Developers
✅ Simpler to maintain and update  
✅ Clearer error messages  
✅ Consistent pattern with `editEvent` tool  
✅ Easier to add new event types in future  
✅ Better documentation and examples  

### For the System
✅ Reduced tool complexity (27% → <10% complex tools)  
✅ Better LLM tool usage rates  
✅ Faster integration for new AI clients  
✅ Fewer edge cases to test  

---

## Migration Checklist

- [ ] Audit current usage of old event tools
- [ ] Update all references to use `createEvent` unified tool
- [ ] Review payload structures for your event types
- [ ] Test with new unified tool
- [ ] Update documentation for your integration
- [ ] Verify type discrimination is correct
- [ ] Test edge cases (null values, empty arrays)
- [ ] Remove old tool references from code
- [ ] Update client library if applicable

---

## Backward Compatibility

### During Transition
- All old tools remain fully functional
- New unified tool available alongside old tools
- No breaking changes to existing integrations
- Deprecation notices added to guide migration

### Old Tools Available
- `createBookEvent` ⚠️ Deprecated
- `createQuoteEvent` ⚠️ Deprecated  
- `createPatentEvent` ⚠️ Deprecated
- `createScientificStudyEvent` ⚠️ Deprecated
- `createUncategorizedEvent` ⚠️ Deprecated
- `createDeathEvent` ⚠️ Deprecated
- `createDocumentaryEvent` ⚠️ Deprecated
- `createTransactionEvent` ⚠️ Deprecated

### Future Deprecation (TBD)
Old tools will be marked for removal after a grace period. The timeline will be announced separately.

---

## Testing Your Migration

### Verify Type Discrimination
```typescript
// ✅ Correct - types match
{
  type: "Book",
  payload: { type: "Book", ... }
}

// ❌ Wrong - types don't match
{
  type: "Book",
  payload: { type: "Quote", ... }
}
```

### Verify Payload Structure
```typescript
// ✅ Correct - Book payload fields
{
  type: "Book",
  payload: {
    title: "...",
    pdfMediaId: "...",
    authors: [...],
    publisher: null
  }
}

// ❌ Wrong - mixing payload types
{
  type: "Book",
  payload: {
    quote: "...",  // This is Quote field, not Book
    actor: "..."
  }
}
```

### Test All Event Types
Ensure your integration handles all 8 event types:
1. Book ✓
2. Death ✓
3. Patent ✓
4. ScientificStudy ✓
5. Uncategorized ✓
6. Documentary ✓
7. Transaction ✓
8. Quote ✓

---

## Common Pitfalls

### Mistake 1: Forgetting payload.type
```typescript
// ❌ Wrong - missing payload.type
{
  type: "Book",
  payload: {
    title: "...",
    authors: [...]
  }
}

// ✅ Correct
{
  type: "Book",
  payload: {
    type: "Book",  // Must include this
    title: "...",
    authors: [...]
  }
}
```

### Mistake 2: Nested object structure errors
```typescript
// ❌ Wrong - authors should be array of objects
authors: ["uuid1", "uuid2"]

// ✅ Correct
authors: [
  { type: "Actor", id: "uuid1" },
  { type: "Actor", id: "uuid2" }
]
```

### Mistake 3: Using undefined instead of null
```typescript
// ❌ Wrong - optional field missing
publisher: undefined

// ✅ Correct
publisher: null
```

### Mistake 4: Wrong type value
```typescript
// ❌ Wrong - type should be "Actor" not "actor"
{ type: "actor", id: "..." }

// ✅ Correct
{ type: "Actor", id: "..." }
```

---

## Support & Resources

### Documentation
- [MCP Tools Overview](./PHASE2-PLAN.md)
- [MCP Tools Complexity Analysis](./mcp-tools-complexity-analysis.md)
- [API MCP Tools Reference](#)

### Examples
- See `services/api/src/routes/mcp/tools/events/__tests__/createUnifiedEvent.e2e.ts` for test examples
- Check `event.tools.ts` for tool registration and descriptions

### Troubleshooting
For issues or questions:
1. Check error messages for schema validation details
2. Review the payload structure for your event type above
3. Verify types match exactly (case-sensitive)
4. Ensure IDs are valid UUIDs from prior searches

---

## FAQ

**Q: Will the old tools stop working?**  
A: Not immediately. They remain functional during the transition period, but are marked as deprecated. A removal timeline will be announced separately.

**Q: Do I have to migrate immediately?**  
A: No. There's a grace period to migrate at your own pace. Old tools continue to work.

**Q: What if I have custom tooling built on the old tools?**  
A: You'll need to migrate your tools to use `createEvent` unified tool, but the payload structures remain the same - just reorganized with the discriminated union pattern.

**Q: How long is the transition period?**  
A: TBD. We'll announce a specific timeline based on adoption metrics.

**Q: Can I use both old and new tools?**  
A: Yes, they can coexist. Recommend migrating to the new tool for all new code.

**Q: Is there a performance difference?**  
A: No, both implementations use the same underlying flow. The unified tool is just a better interface to the same functionality.

---

## Migration Timeline

| Phase | Duration | Status | Action |
|-------|----------|--------|--------|
| 1: Introduction | Now | Active | Start using `createEvent` unified tool |
| 2: Transition | TBD | Planned | Old tools remain deprecation warnings |
| 3: Removal | TBD | Future | Old tools will be removed |

---

## Version History

- **v2.0 (Current)**: Unified event creation tool released
- **v1.0 (Previous)**: 8 separate specialized tools

---

**For questions or issues, please refer to the [lies.exposed GitHub repository](https://github.com/lies-exposed/lies.exposed).**
