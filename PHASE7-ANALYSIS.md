# Phase 7: Edit Operation Consolidation - Analysis

**Status:** Analysis Phase - In Progress
**Date:** February 14, 2026
**Focus:** Review EDIT tools and identify consolidation opportunities

## Current EDIT Tool Inventory

### All EDIT Operations (7 tools)

| Tool | File | Pattern | Optional Fields | Status |
|------|------|---------|-----------------|--------|
| EDIT_ACTOR | editActor.tool.ts | UndefinedOr | All except ID | ✓ Standard |
| EDIT_GROUP | editGroup.tool.ts | UndefinedOr | All except ID | ✓ Standard |
| EDIT_EVENT | editEvent.tool.ts | **Discriminated Union** | Type determines payload | ✓ Advanced |
| EDIT_MEDIA | editMedia.tool.ts | Mixed | Some required (location, type, label) | ⚠ Non-standard |
| EDIT_LINK | editLink.tool.ts | UndefinedOr | All except ID | ✓ Standard |
| EDIT_AREA | editArea.tool.ts | UndefinedOr | All except ID | ✓ Standard |

**Total EDIT Operations:** 6 distinct tools

### Pattern Analysis

#### Pattern 1: UndefinedOr (Most Common - 5 tools)
```typescript
// Example: editActor.tool.ts
export const EditActorInputSchema = Schema.Struct({
  id: UUID,  // Required
  username: Schema.UndefinedOr(Schema.String),  // Optional
  fullName: Schema.UndefinedOr(Schema.String),  // Optional
  color: Schema.UndefinedOr(Schema.String),     // Optional
  // ... all other fields optional
});
```

**Tools using this pattern:**
- editActor
- editGroup
- editLink
- editArea

**Characteristics:**
- Direct field-by-field API
- All fields except ID are optional
- Simple and predictable
- Easy to understand for LLM agents

#### Pattern 2: Discriminated Union (Advanced - 1 tool)
```typescript
// Example: editEvent.tool.ts
export const EditEventInputSchema = Schema.Struct({
  id: UUID,  // Required
  ...baseEditEventSchema.fields,  // Shared fields
  payload: EditEventTypeAndPayload,  // Type determines structure
});
```

**Tools using this pattern:**
- editEvent (handles 8 event types)

**Characteristics:**
- Unified interface for multiple entity types
- Type field discriminates payload structure
- More complex but powerful
- Already follows CREATE_EVENT pattern

#### Pattern 3: Mixed Required/Optional (Non-standard - 1 tool)
```typescript
// Example: editMedia.tool.ts
export const EditMediaInputSchema = Schema.Struct({
  id: UUID,           // Required
  location: URL,      // Required (for external URL)
  type: MediaType,    // Required
  label: Schema.String,  // Required
  description: Schema.UndefinedOr(Schema.String),  // Optional
});
```

**Tools using this pattern:**
- editMedia

**Characteristics:**
- Required fields: location, type, label
- Only description is optional
- Makes sense for media domain (must know what/where you're updating)
- Diverges from standard pattern

---

## Consolidation Opportunities

### Opportunity 1: Create Unified EDIT Tool
**Scope:** Consolidate Actor/Group/Link/Area EDIT operations into single unified tool

**Rationale:**
- 4 tools follow identical UndefinedOr pattern
- Discriminated union approach works well (proven by CREATE_EVENT)
- Single tool reduces LLM decision trees
- Consistent with Phase 1 event consolidation approach

**Proposal:**
```typescript
// editUnified.tool.ts - Single EDIT tool for all entity types
const EditUnifiedSchema = Schema.Struct({
  id: UUID,  // Entity UUID
  type: Schema.Union(
    Schema.Literal("Actor"),
    Schema.Literal("Group"),
    Schema.Literal("Link"),
    Schema.Literal("Area"),
  ),
  payload: EditActorPayload | EditGroupPayload | EditLinkPayload | EditAreaPayload,
  // All optional fields in their respective payloads
});

// Register single EDIT tool instead of 4 separate tools
server.registerTool(EDIT, {
  title: "Edit entity",
  description: "Update any entity type (actor, group, link, area)...",
  inputSchema: effectToZodStruct(EditUnifiedSchema),
});
```

**Impact:**
- Reduces 4 tools → 1 unified control point
- Backward compatibility through deprecated variants
- LLM agents make better decisions (single interface)
- Consistent with event consolidation precedent

### Opportunity 2: Standardize Media EDIT Pattern
**Scope:** Decide on EDIT_MEDIA required vs optional field strategy

**Current Issue:**
```
EDIT_MEDIA requires: location, type, label
EDIT_ACTOR requires: only id
EDIT_GROUP requires: only id
```

**Options:**

**Option A: Make media fields truly optional**
- Change location, type, label to UndefinedOr
- Any omitted field keeps current value
- Matches other EDIT tool pattern

**Option B: Keep current pattern (some required)**
- Location, type, label must be provided
- Rationale: These fundamentally define the media entity
- Diverges from standard but more "correct"

**Recommendation:** Option A
- **Why:** Consistency with other tools
- Reduces parameter requirements for LLM agents
- Still allows flexibility (can update just name, keep other metadata)

### Opportunity 3: Standardize Description/Documentation
**Scope:** Update all EDIT tool descriptions for consistency

**Current Issues:**
1. Descriptions vary in detail (some mention field behavior, some don't)
2. Some tools explain update semantics, others don't
3. Inconsistent emphasis on "you only need to provide fields to update"

**Template Proposal:**
```
DESCRIPTION TEMPLATE FOR EDIT TOOLS:

"Update an existing [entity type] in the database. Only provide fields you 
want to change; omitted fields keep their existing values.

FIELD UPDATE BEHAVIOR:
- Omitted fields: Keep current value
- null/undefined: Clear/remove value (varies by field)
- Empty arrays: Clear array

REQUIRED:
- id: UUID of [entity] to update

OPTIONAL (provide only fields to change):
- field1: Description
- field2: Description
- ...

TIPS:
- Search for [entity] first if unsure of ID
- Only send fields you're actually updating
- Returns updated entity with full details"
```

---

## Phase 7 Work Plan

### Phase 7a: Analysis (CURRENT) ✓
- [x] Inventory all EDIT tools
- [x] Identify patterns and inconsistencies
- [x] Document consolidation opportunities
- [x] Create recommendations

### Phase 7b: Design Unified EDIT Pattern
- [ ] Design unified EDIT schema (similar to CREATE_EVENT)
- [ ] Create discriminated union payload structure
- [ ] Document backward compatibility approach
- [ ] Plan migration path

### Phase 7c: Implementation Decision
- [ ] Get feedback on unified EDIT approach
- [ ] Decide: Consolidate into 1 tool vs improve existing tools
- [ ] If consolidate: Proceed with Phase 7d
- [ ] If improve: Standardize existing tools only

### Phase 7d: Implementation (If Unified)
- [ ] Create unified editUnified.tool.ts with discriminated union
- [ ] Deprecate individual EDIT_* tools
- [ ] Create tool registration for EDIT
- [ ] Update documentation

### Phase 7e: Implementation (If Standardization)
- [ ] Standardize EDIT_MEDIA optional/required fields
- [ ] Update all EDIT tool descriptions with template
- [ ] Fix any wording inconsistencies
- [ ] Ensure all follow same pattern

### Phase 7f: Testing & Validation
- [ ] Run full test suite
- [ ] Verify backward compatibility (if applicable)
- [ ] Update test fixtures (if needed)
- [ ] Create migration documentation

### Phase 7g: Documentation & Commit
- [ ] Create before/after comparison
- [ ] Document consolidation (if applicable)
- [ ] Git commit with detailed changelog
- [ ] Update progress tracking

---

## Decision Matrix

### Should we consolidate EDIT tools like we did with CREATE?

#### PROS of Unified EDIT Tool
- Consistent with CREATE_EVENT consolidation approach
- Reduces decision tree for LLM agents (1 tool vs 6)
- Single interface simplifies learning curve
- Discriminated union pattern proven with events
- Reduces recursion limit pressure (1 tool vs 6)

#### CONS of Unified EDIT Tool
- More complex schema (discriminated union)
- Less "obvious" which tool to use
- Breaking change to API (though backward compatible)
- Requires migration path
- May be over-engineering for EDIT cases

#### PROS of Standardizing Existing Tools
- Less disruptive
- Simpler immediate payoff
- Keeps familiar structure
- EDIT operations less frequently used than CREATE
- Lower risk approach

#### CONS of Standardizing Existing Tools
- Still 6 separate tools to manage
- Inconsistency with CREATE consolidation approach
- LLM agents still need to choose right tool
- Doesn't address root problem

---

## Recommendation

**Recommended Approach: Hybrid**

**Phase 7 (Immediate):**
1. Standardize existing EDIT tool descriptions (low risk, high clarity)
2. Fix EDIT_MEDIA to match pattern (make optional; standardize behavior)
3. Document field update semantics consistently

**Phase 8+ (Future):**
1. If agent feedback shows tool selection is confusing → Consolidate
2. If standardized EDIT tools work well → Continue current approach
3. Monitor consolidation benefits from Phase 1 before deciding

---

## Estimated Timeline

**Standardization Only (Phase 7a-f):** 2-3 hours
- Update descriptions
- Fix optional field consistency
- Testing and documentation

**Full Consolidation (Phase 7a-g):** 4-5 hours
- Design unified pattern
- Implement discriminated union
- Comprehensive testing
- Migration documentation

---

## Key Questions for Stakeholders

1. **Agent Usage:** How often do agents choose the wrong EDIT tool?
   - If high: Consolidation is justified
   - If low: Standardization is sufficient

2. **Consistency Priority:** Is consistency with CREATE consolidation important?
   - If yes: Proceed with unified EDIT
   - If no: Standardization is enough

3. **Risk Tolerance:** How conservative should improvements be?
   - If high: Standardization first, consolidation later
   - If low: Consolidation with full testing

---

## Next Steps

**Option A: Proceed with Standardization Only**
- Quick improvement without major restructuring
- Safe, low-risk approach
- Can always consolidate later

**Option B: Full Consolidation**
- Consistent approach with CREATE
- More powerful, single interface
- More complex, higher risk

**Recommendation:** Start with Option A (standardization), monitor usage, consolidate if needed in Phase 8.

---

**Current Status:** Analysis Complete, Ready for Next Decision Point

