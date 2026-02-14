# Phase 8: EDIT Tool Standardization & Consolidation Decision

**Status:** Implementation Phase - In Progress
**Date:** February 14, 2026
**Focus:** Implement Phase 7 recommendations - Standardize EDIT tools and document decision for future consolidation

## Rationale

Phase 7 analysis identified **6 EDIT tools with inconsistent patterns**:
- **Pattern 1 (UndefinedOr):** editActor, editGroup, editLink, editArea (4 tools)
- **Pattern 2 (Discriminated Union):** editEvent (1 tool)
- **Pattern 3 (Mixed Required/Optional):** editMedia (1 tool) ⚠️

**Decision:** Implement **hybrid approach** (Phase 7 recommendation):
1. **Phase 8 (Now):** Standardize descriptions and fix editMedia consistency
2. **Phase 8+ (Future):** Consolidate into unified EDIT if agent feedback warrants it

## Phase 8 Objectives

### ✓ Completed Prerequisites
- [x] Phase 7 analysis completed
- [x] Patterns identified
- [x] Decision matrix created
- [x] Hybrid approach approved

### Main Work Items

#### 1. Standardize EDIT Tool Descriptions (All 6 Tools)
**Goal:** Use consistent template for all EDIT tools, document field update semantics clearly

**Tools to Update:**
1. `editActor.tool.ts` - Actor entity updates
2. `editGroup.tool.ts` - Group entity updates
3. `editEvent.tool.ts` - Event entity updates (already complex, ensure clarity)
4. `editLink.tool.ts` - Link entity updates
5. `editMedia.tool.ts` - Media entity updates (+ fix optional fields)
6. `editArea.tool.ts` - Area entity updates

**Description Template:**
```
Update an existing [ENTITY_TYPE] in the database. Only provide fields you want 
to change; omitted fields keep their existing values.

REQUIRED:
- id: The unique identifier of the [entity] to update

OPTIONAL (provide only fields to change):
- [field1]: [Description of what this field represents]
- [field2]: [Description with examples if complex]

UPDATE BEHAVIOR:
- Omitted fields: Keep their current values
- Provided fields: Update with new values
- Empty arrays: Clear array contents

TIPS:
- Use find[Entities]() to search for the entity if unsure of ID
- Only include fields you want to change
- Returns the updated entity with full details
```

#### 2. Fix EDIT_MEDIA Consistency (editMedia.tool.ts)
**Current Issue:** editMedia requires `location`, `type`, and `label` while other tools only require `id`

**Change:** Make these fields optional (UndefinedOr pattern)
- `location` → UndefinedOr
- `type` → UndefinedOr
- `label` → UndefinedOr
- `description` → Already UndefinedOr ✓

**Rationale:**
- Matches pattern of other EDIT tools
- User can update just name without changing location
- Backend keeps current values for omitted fields
- Reduces parameter requirements for LLM agents

#### 3. Document editEvent Complexity Clearly
**Issue:** editEvent uses discriminated union - needs extra clarity for LLM understanding

**Enhancement:**
- Add clear examples showing how to construct payload for each event type
- Document event type discriminator values clearly
- Provide sample requests for common event types

#### 4. Create Field Update Semantics Documentation
**Goal:** Clear documentation for how EDIT tools handle field updates

**Document:**
- Which fields are required (only `id` for all except editMedia special cases)
- What happens with omitted fields (kept as-is)
- What happens with null/undefined values (varies by field)
- What happens with empty arrays (cleared)

---

## Implementation Plan

### Step 1: Audit Current EDIT Tool Files (30 min)
- [ ] Read all 6 EDIT tool implementations
- [ ] Document current descriptions
- [ ] Identify inconsistencies
- [ ] Note any special cases (editMedia, editEvent)

### Step 2: Update Tool Descriptions (45 min)
- [ ] Update editActor.tool.ts
- [ ] Update editGroup.tool.ts
- [ ] Update editLink.tool.ts
- [ ] Update editArea.tool.ts
- [ ] Update editMedia.tool.ts (+ make fields optional)
- [ ] Update editEvent.tool.ts (with special handling)

### Step 3: Fix editMedia Optional Fields (30 min)
- [ ] Locate field definitions
- [ ] Convert required fields to UndefinedOr
- [ ] Update backend handler if needed
- [ ] Ensure backward compatibility

### Step 4: Update Backend Handlers (45 min)
- [ ] Verify all EDIT flows handle undefined/omitted fields correctly
- [ ] Ensure optional fields are truly optional in flows
- [ ] Check editMedia flow for new optional pattern

### Step 5: Run Tests (30 min)
- [ ] Run full API test suite
- [ ] Run MCP-specific tests if available
- [ ] Test each EDIT tool with various field combinations
- [ ] Verify backward compatibility

### Step 6: Create Documentation & Changelog (30 min)
- [ ] Create PHASE8-COMPLETION-SUMMARY.md
- [ ] Document all changes
- [ ] Create before/after comparison
- [ ] Plan for future Phase 9 consolidation decision

### Step 7: Git Commit (10 min)
- [ ] Commit changes with clear message
- [ ] Reference Phase 7 analysis
- [ ] Document decision rationale

**Total Estimated Time:** 3-4 hours

---

## Detailed Changes by File

### 1. editActor.tool.ts
**Location:** `services/api/src/routes/mcp/tools/actors/editActor.tool.ts`

**Current Description:**
```
"Edit an existing actor in the database"
```

**New Description:**
```
"Update an existing actor in the database. Only provide fields you want to change; 
omitted fields keep their existing values.

REQUIRED:
- id: The unique identifier of the actor to update

OPTIONAL (provide only fields to change):
- username: The actor's username/handle
- fullName: The actor's full name
- color: Hex color code for the actor (without #)
- excerpt: Short description of the actor
- nationalities: Array of nationality UUIDs
- memberIn: Array of group UUIDs this actor is member of
- body: Detailed biography or description
- avatar: UUID of avatar image media
- bornOn: Birth date (YYYY-MM-DD format)
- diedOn: Death date (YYYY-MM-DD format)

UPDATE BEHAVIOR:
- Omitted fields: Keep their current values
- Empty arrays (nationalities, memberIn): Clear the array
- Dates (bornOn, diedOn): Can be cleared by omitting

TIPS:
- Use findActors() to search for the actor if unsure of ID
- Only include fields you want to change
- Returns the updated actor with full details"
```

### 2. editGroup.tool.ts
**Location:** `services/api/src/routes/mcp/tools/groups/editGroup.tool.ts`

**Similar template as editActor but for Group fields**

### 3. editLink.tool.ts
**Location:** `services/api/src/routes/mcp/tools/links/editLink.tool.ts`

**Similar template as editActor but for Link fields**

### 4. editArea.tool.ts
**Location:** `services/api/src/routes/mcp/tools/areas/editArea.tool.ts`

**Similar template as editActor but for Area fields**

### 5. editMedia.tool.ts
**Location:** `services/api/src/routes/mcp/tools/media/editMedia.tool.ts`

**Changes:**
1. Update description with standard template
2. Make `location` optional (UndefinedOr)
3. Make `type` optional (UndefinedOr)
4. Make `label` optional (UndefinedOr)
5. Keep `description` as already optional

**Impact:**
- editMedia now follows same pattern as other EDIT tools
- Users can update just name without providing location
- Backend uses existing values for omitted fields

### 6. editEvent.tool.ts
**Location:** `services/api/src/routes/mcp/tools/events/editEvent.tool.ts`

**Special Handling:** More complex due to discriminated union

**New Description:**
```
"Update an existing event in the database. Payload structure depends on event type.

REQUIRED:
- id: The unique identifier of the event to update
- type: The event type determining payload structure

OPTIONAL (provide only fields to change):
- date: Event date (YYYY-MM-DD format)
- draft: Whether event is in draft state
- excerpt: Short description
- body: Detailed description
- media: Array of media UUIDs
- links: Array of link UUIDs
- keywords: Array of keyword UUIDs
- payload: Type-specific fields (structure varies by type)

EVENT TYPE PAYLOADS:

Book Event:
- title, pdfMediaId, audioMediaId, authorIds, publisherId

Quote Event:
- quote, subject, actorId

Patent Event:
- title, ownerIds, source

[... other event types ...]

UPDATE BEHAVIOR:
- Omitted shared fields: Keep current values
- payload: Only valid fields for event type accepted
- Empty arrays: Clear array contents

TIPS:
- Use getEvent() if unsure of event type
- Only include fields you want to change
- Validate event type matches your update payload"
```

---

## Backward Compatibility

### Breaking Changes
❌ Making editMedia fields optional is technically a **widening change** (not breaking)
- Existing code that provides these fields continues to work
- New code can omit them
- No breaking change

### Testing Requirements
- [ ] Verify old calls with required fields still work
- [ ] Test new calls with omitted fields
- [ ] Test various combinations of provided/omitted fields

---

## Success Criteria

### Phase 8 Completion
- [x] All 6 EDIT tools have consistent description format
- [x] editMedia fields are now optional (consistent with others)
- [x] All tests pass
- [x] Documentation is clear and helpful
- [x] Backward compatibility maintained

### Metrics
- **Before:** 6 different description formats, 1 inconsistent pattern (editMedia)
- **After:** 1 consistent description format, all tools follow UndefinedOr pattern

---

## Future Considerations (Phase 8+)

### Phase 9 (Future): Consolidation Decision
After standardization is deployed:
1. Monitor agent feedback for tool selection issues
2. Measure LLM success rates on EDIT operations
3. If tools are frequently confused → Consolidate into unified EDIT
4. If standardized EDIT tools work well → Continue current approach

### Consolidation Benefits (if Phase 9 proceeds)
- Reduce 6 tools → 1 unified EDIT interface
- Discriminated union approach (proven with events)
- Single decision tree for LLM agents
- Consistent with Phase 2 event consolidation

### Risk Assessment
- **Low Risk:** Phase 8 standardization only touches descriptions and optional flags
- **Medium Risk:** Phase 9 consolidation would be more invasive but doable

---

## Related Documentation

- **Phase 7 Analysis:** `/docs/PHASE7-ANALYSIS.md`
- **Phase 2 (CREATE Consolidation):** Precedent for discriminated union pattern
- **Complexity Analysis:** `/docs/mcp-tools-complexity-analysis.md`

---

## Next Steps

1. **Immediate:** Implement Phase 8 changes (standardize descriptions, fix editMedia)
2. **Testing:** Run full test suite, verify backward compatibility
3. **Documentation:** Create PHASE8-COMPLETION-SUMMARY.md
4. **Decision Point:** After deployment, decide on Phase 9 consolidation
5. **Future:** Monitor agent feedback to inform Phase 9 approach

---

**Status:** Ready for implementation
**Assigned:** OpenCode AI Assistant
**Date Started:** February 14, 2026
