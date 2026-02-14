# Phase 6: Tool Registration Standardization Plan

**Status:** Analysis Complete | Ready for Implementation
**Date:** February 14, 2026

## Complete Tool Inventory & Current State

### Tool Description Lengths (Actual Characters)

| Tool | Type | Current Length | Assessed Detail |
|---|---|---|---|
| Actor - FIND_ACTORS | FIND | ~350 | HIGH (search strategy tips) |
| Actor - CREATE_ACTOR | CREATE | ~400 | MEDIUM (basic) |
| Group - FIND_GROUPS | FIND | ~450 | HIGH (search strategy tips) |
| Group - CREATE_GROUP | CREATE | ~550 | MEDIUM (basic) |
| Media - FIND_MEDIA | FIND | ~200 | VERY LOW (minimal) |
| Media - CREATE_MEDIA | CREATE | ~350 | MEDIUM (two modes) |
| Media - GET_MEDIA | GET | ~100 | VERY LOW (minimal) |
| Event - FIND_EVENTS | FIND | ~200 | VERY LOW (minimal) |
| Event - CREATE_EVENT | CREATE | ~450 | HIGH (unified with examples) |
| Link - FIND_LINKS | FIND | ~85 | VERY LOW (minimal) |
| Link - CREATE_LINK | CREATE | ~140 | VERY LOW (generic) |
| Link - GET_LINK | GET | ~70 | VERY LOW (minimal) |
| Link - EDIT_LINK | EDIT | ~130 | VERY LOW (generic) |
| Area - FIND_AREAS | FIND | ~90 | VERY LOW (minimal) |
| Area - CREATE_AREA | CREATE | ~140 | VERY LOW (generic) |
| Area - GET_AREA | GET | ~90 | VERY LOW (minimal) |
| Area - EDIT_AREA | EDIT | ~150 | VERY LOW (generic) |
| Nation - FIND_NATIONS | FIND | ~280 | MEDIUM (has examples + CRITICAL) |
| Nation - GET_NATION | GET | ~90 | VERY LOW (minimal) |

**Variance Found:**
- Shortest: 70 chars (LINK - GET_LINK)
- Longest: 450 chars (EVENT - CREATE_EVENT, GROUP - CREATE_GROUP)
- **Ratio:** 6.4x variance in description length

### Pattern Analysis Results

#### Pattern 1: Search Emphasis (INCONSISTENT)
- ✓ **Actors**: "Search for actors using various criteria..."
- ✓ **Groups**: "Search for groups using various criteria..."
- ✓ **Nations**: "ALWAYS use this tool... Returns nation details... Common searches: 'United States', 'Italy'..."
- ✗ **Media**: "Search for media..."
- ✗ **Events**: No FIND_EVENTS description guidance
- ✗ **Links**: "Search for links..."
- ✗ **Areas**: "Search for areas..."

**Finding:** Nations tool has the best FIND pattern with CRITICAL emphasis and examples. Should be template.

#### Pattern 2: CREATE Tool Detail (HIGHLY INCONSISTENT)
- **Detailed (500+ chars):**
  - Event tools (multi-event types)
  - Group tools (configuration object)
- **Moderate (300-400 chars):**
  - Actor tools (basic description)
  - Media tools (two modes)
- **Minimal (100-150 chars):**
  - Link tools (generic)
  - Area tools (generic)

**Finding:** No consistency. Links and Areas are too brief for LLM agents to understand correctly.

#### Pattern 3: GET Tool Descriptions (UNIVERSAL PATTERN EXISTS)
All GET tools follow same pattern:
```
"Retrieve a [entity] by its ID. Returns the [entity] details in structured markdown format."
```
**Good news:** GET tools are already standardized! Move to FIND and CREATE focus.

#### Pattern 4: EDIT Tool Descriptions (MOSTLY CONSISTENT)
Pattern: "Edit an existing [entity]... Only provided fields will be updated. Returns..."
**Status:** Mostly good, needs minor consistency tweaks.

### Critical Gaps Identified

| Gap | Tools Affected | Severity | Impact |
|---|---|---|---|
| Minimal FIND descriptions | MEDIA, LINKS, AREAS | HIGH | Agent doesn't know what search criteria available |
| No CREATE examples | LINK, AREA | HIGH | Agent may create entities incorrectly |
| Generic descriptions | LINK (all), AREA (all) | MEDIUM | LLM doesn't understand domain context |
| Missing CRITICAL notes | Most FIND tools | MEDIUM | Agent doesn't know to "always search first" |
| No variant guidance | Most tools | LOW | Agent doesn't know about abbreviations/variations |

## Standardization Strategy

### Phase 6a: Template Development (IMMEDIATE)

**Template 1: FIND_ACTOR/FIND_GROUPS (HIGH IMPACT)**

**Current (Actor):**
```
"Search for actors using various criteria like name or keywords. Returns the actor in JSON format"
```

**Proposed:**
```
"Search for actors by name or keywords. CRITICAL: Always search before creating actors to avoid duplicates.

SEARCH EXAMPLES:
- Full name: 'Donald Trump'
- Last name: 'Trump'
- Alias: 'The Donald'
- Partial: 'Don'

Returns matching actors with full details."
```

**Why Better:**
1. Emphasizes duplicate prevention (business logic)
2. Shows search variation examples (practical guidance)
3. Sets expectations for return value
4. More useful for LLM agent decision-making

---

**Template 2: CREATE_ACTOR/CREATE_GROUPS (HIGH IMPACT)**

**Current (Actor):**
```
"Create a new actor in the database with required name and username. Returns the created actor details."
```

**Proposed:**
```
"Create a new actor in the database.

REQUIRED FIELDS:
- username: Unique identifier (kebab-case)
- fullName: Complete actor name

OPTIONAL IN CONFIG:
- color: Hex code for UI display
- excerpt: Short biography
- birthDate, deathDate: ISO format dates
- nationality: Nation ID (use FIND_NATIONS first)

TIPS:
- Always FIND_ACTORS first to avoid duplicates
- Username must be unique
- Color should be readable in UI contexts"
```

**Why Better:**
1. Clear required vs optional
2. Practical examples (kebab-case, ISO format)
3. Cross-tool guidance (FIND first, FIND_NATIONS)
4. Contextual tips (UI readability)

---

**Template 3: FIND_NATIONS (BEST EXISTING PATTERN)**

**Current:**
```
"Search for nations/nationalities/countries using various criteria like name or ISO code. ALWAYS use this tool to find nationality IDs before using them in actor operations. Returns nation details in structured markdown format. Common searches: 'United States', 'Italy', 'France', 'Germany', 'China', 'Russia', etc."
```

**Assessment:** Already good! Use as reference for other FIND tools.

---

**Template 4: CREATE_LINK (NEEDS HELP)**

**Current:**
```
"Create a new link in the database with the provided URL and metadata. Returns the created link details in structured markdown format."
```

**Proposed:**
```
"Create a new link in the database, storing URL and metadata for reference in fact-checking.

REQUIRED FIELDS:
- url: HTTP/HTTPS URL (must be valid URL format)

OPTIONAL IN CONFIG:
- title: Override page title if desired
- description: Custom summary of link content
- publishDate: When article was published (ISO format)
- provider: Source domain or platform name
- image: Featured image URL

EXAMPLES:
1. Minimal: { url: 'https://news.example.com/article' }
   → Creates link with auto-fetched title and metadata

2. Full: { url: '...', title: 'Custom Title', description: '...', publishDate: '2026-02-14' }
   → Creates link with all metadata specified"
```

**Why Better:**
1. Explains domain context (storing for fact-checking)
2. Shows validation requirements (valid URL format)
3. Provides concrete examples (minimal vs full)
4. Clear what happens with optional fields

### Phase 6b: Implementation Approach

**Step 1: Standardize FIND Tools** (6 files, 30 min)
1. Apply Nations template structure to other FIND tools
2. Add search strategy examples to each
3. Add CRITICAL workflow notes
4. Add expected return format hints

**Step 2: Standardize CREATE Tools** (6 files, 45 min)
1. Add REQUIRED FIELDS section
2. Add OPTIONAL IN CONFIG section
3. Add EXAMPLES section (2+ examples)
4. Add TIPS section with cross-tool guidance

**Step 3: Minor Fixes** (6 files, 15 min)
1. Ensure GET tools are all same format ✓ Already done
2. Minor tweaks to EDIT tools for consistency
3. Validate all descriptions fit context window

### Phase 6c: Files to Modify (Priority Order)

**HIGHEST PRIORITY (Most Used by Agents):**
```
1. services/api/src/routes/mcp/tools/links/link.tools.ts
2. services/api/src/routes/mcp/tools/areas/area.tools.ts
3. services/api/src/routes/mcp/tools/events/event.tools.ts
```

**HIGH PRIORITY (Foundational):**
```
4. services/api/src/routes/mcp/tools/actors/actor.tools.ts
5. services/api/src/routes/mcp/tools/groups/group.tools.ts
```

**MEDIUM PRIORITY (Reference):**
```
6. services/api/src/routes/mcp/tools/media/media.tools.ts
7. services/api/src/routes/mcp/tools/nations/nations.tools.ts
```

### Expected Outcomes After Standardization

| Metric | Before | After | Improvement |
|---|---|---|---|
| Avg description length | 230 chars | 400 chars | +73% more guidance |
| Tools with examples | 3/7 | 7/7 | +133% |
| Tools emphasizing "search first" | 2/6 FIND | 6/6 FIND | +200% |
| Agent confusion signals (predicted) | High | Low | Clear reduction |
| LLM decision quality (predicted) | Medium | High | Better outcomes |

## Implementation Timeline

**Estimated: 3-4 hours total**

- **Phase 6a-Step 1:** 30 min (FIND tool descriptions)
- **Phase 6a-Step 2:** 45 min (CREATE tool descriptions)  
- **Phase 6a-Step 3:** 15 min (Fixes and validation)
- **Testing & Validation:** 1 hour
- **Documentation:** 30 min

## Validation Checklist

After implementation, verify:

- [ ] All FIND tools have search strategy examples
- [ ] All FIND tools emphasize "search before create"
- [ ] All CREATE tools have REQUIRED FIELDS section
- [ ] All CREATE tools have OPTIONAL CONFIG section
- [ ] All CREATE tools have 2+ examples
- [ ] All CREATE tools mention related tools (FIND_*)
- [ ] All GET tools follow standard format
- [ ] All EDIT tools mention omittable/null behavior
- [ ] No tool description exceeds 600 characters
- [ ] Descriptions are grammatically consistent
- [ ] Examples use realistic data

## Success Criteria

✓ **Objective Met When:**
1. All 7 tool files follow same pattern for each tool type
2. Agent testing shows reduced retry rates
3. Descriptions are scannable and actionable
4. Examples work with actual data schemas
5. Cross-tool references are consistent (FIND_* mentioned in CREATE)

---

**Next Phase:** Phase 6d - Actual implementation of standardization (ready to begin)

**Files Created:**
- `PHASE6-CONSISTENCY-ANALYSIS.md` (baseline)
- `PHASE6-STANDARDIZATION-PLAN.md` (this file - ready for execution)

