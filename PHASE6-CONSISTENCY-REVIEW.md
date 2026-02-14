# Phase 6: Cross-Tool Consistency Review

**Status:** IN PROGRESS
**Objective:** Ensure consistent UX across all MCP tools through standardized descriptions, naming, and error handling

## Overview

After consolidating tools and reducing parameters in Phases 1-5, we now focus on making the tool API consistent and predictable for LLM agents.

## Key Areas to Review

### 1. Tool Description Standardization
- **Current State:** Tool descriptions vary in format, length, and detail
- **Goal:** Establish consistent pattern for all tool descriptions
- **Review Files:**
  - `actor.tools.ts` - CREATE_ACTOR, FIND_ACTORS, EDIT_ACTOR
  - `group.tools.ts` - CREATE_GROUP, FIND_GROUPS, EDIT_GROUP
  - `media.tools.ts` - CREATE_MEDIA, EDIT_MEDIA, FIND_MEDIA
  - `event.tools.ts` - CREATE_EVENT (unified), EDIT_EVENT, FIND_EVENTS
  - `link.tools.ts` - CREATE_LINK, FIND_LINKS, EDIT_LINK
  - `area.tools.ts` - CREATE_AREA, FIND_AREAS, EDIT_AREA
  - `nations.tools.ts` - GET_NATION, FIND_NATIONS

### 2. Parameter Naming Consistency
- **Goal:** Ensure parameter names follow consistent conventions across all tools
- **Review Items:**
  - config vs. configuration
  - nationalityIds vs. nationality_ids vs. nations
  - startDate vs. start_date
  - Use of verb phrases vs. nouns

### 3. Example Output Standardization
- **Current State:** Tool descriptions may have inconsistent examples
- **Goal:** Add consistent "Example" sections to key tools
- **Focus:** CREATE tools (most user-facing for learning)

### 4. Error Message Consistency
- **Goal:** Ensure error handling follows predictable patterns
- **Review:** Error messages across FIND, CREATE, EDIT operations

### 5. Documentation Link Consistency
- **Goal:** All tools should reference consistent documentation
- **Pattern:** Link format, placement, content

## files to Modify in Phase 6

### High Priority (Common tools)
- [ ] `actor.tools.ts` - 3 tools
- [ ] `group.tools.ts` - 3 tools
- [ ] `media.tools.ts` - 3 tools
- [ ] `event.tools.ts` - 2 tools (CREATE_EVENT is unified, EDIT unified)
- [ ] `link.tools.ts` - 3 tools

### Medium Priority (Organization tools)
- [ ] `area.tools.ts` - 3 tools
- [ ] `nations.tools.ts` - 2 tools

## Consistency Patterns to Establish

### Pattern 1: CREATE Tool Description
```
✅ STANDARD FORMAT:
{
  description: "Create a new [entity]. Only [N] required fields needed: [list]. Optional fields can be provided in config object.",
  inputSchema: {
    // description: "Required parameter name"
    // config.fieldName: "Optional field description"
  }
}
```

### Pattern 2: FIND Tool Description
```
✅ STANDARD FORMAT:
{
  description: "Find and retrieve [entities] by search criteria. Returns matching results with full details.",
  inputSchema: {
    // searchTerm, filters, limit, offset
  }
}
```

### Pattern 3: EDIT Tool Description
```
✅ STANDARD FORMAT:
{
  description: "Update an existing [entity]. Provide entity ID and only fields you want to change.",
  inputSchema: {
    // id: "UUID of the [entity] to modify"
    // field: "Only include fields to update"
  }
}
```

## Phase 6 Deliverables

### Documentation
1. **PHASE6-CONSISTENCY-GUIDE.md** - Detailed standards document
2. **TOOL-DESCRIPTIONS-BEFORE-AFTER.md** - Comparison of changes
3. **CONSISTENCY-CHECKLIST.md** - Verification checklist

### Code Changes
1. Updated all `*.tools.ts` files with consistent descriptions
2. Standardized parameter naming where needed
3. Added examples to high-impact tools
4. Ensured error handling consistency

### Validation
- [ ] All CREATE tools follow same description pattern
- [ ] All FIND tools follow same description pattern
- [ ] All EDIT tools follow same description pattern
- [ ] Error messages use consistent format
- [ ] LLM can predictably understand any tool by description

## Progress Tracker

### Pre-Phase Review
- [x] Identified all tool registration files (7 files)
- [x] Created Phase 6 plan

### Step 1: Analysis
- [ ] Read and compare all current tool descriptions
- [ ] Document current inconsistencies
- [ ] Create before/after comparison

### Step 2: Standardization
- [ ] Apply CREATE tool pattern
- [ ] Apply FIND tool pattern
- [ ] Apply EDIT tool pattern
- [ ] Standardize error messages

### Step 3: Validation & Documentation
- [ ] Verify all tools follow patterns
- [ ] Create consistency guide
- [ ] Document changes for release notes

---

**Next Action:** Begin Step 1 - Analyze current tool descriptions across all 7 tool files
**Estimated Duration:** 2-3 hours
**Impact:** Improved LLM usability, reduced agent decision-making time

