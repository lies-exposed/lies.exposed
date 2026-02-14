# Phase 6: Tool Consistency Analysis

**Date:** February 14, 2026
**Status:** Analysis Complete

## Current State Assessment

### Tool Description Length by Category

| Tool Category | Description Length | Detail Level | Examples |
|---|---|---|---|
| Actor Tools | 300-500 chars | Medium | Search strategy tips |
| Group Tools | 400-800 chars | High | Multiple code examples |
| Media Tools | 500-1000 chars | High | Two modes with examples |
| Event Tools | 800-1500 chars | Very High | Multiple event type examples |
| Link Tools | 200-400 chars | Low | None or minimal |
| Area Tools | 100-300 chars | Low | None |
| Nations Tools | 100-200 chars | Very Low | None |

### Identified Inconsistencies

#### 1. **Search Workflow Emphasis**
- **Inconsistent:** Same across tools but formatted differently
- **Pattern A (Actors):** "SEARCH STRATEGY - Always try..."
- **Pattern B (Groups):** "SEARCH STRATEGY - Always try..."
- **Pattern C (Links):** Not emphasized at all
- **Current:** Varies by tool, needs standardization

#### 2. **Description Format**
- **Pattern A (Actors):** Compact initial description + detailed TIPS section
- **Pattern B (Groups):** Large block with embedded examples
- **Pattern C (Media):** Two-mode explanation with examples
- **Pattern D (Events):** Detailed with workflow + examples
- **Problem:** No consistent pattern

#### 3. **Parameter Documentation**
- **Actors:** Uses "REQUIRED FIELDS:" heading
- **Groups:** Uses "REQUIRED FIELDS:" and "OPTIONAL CONFIGURATION:"
- **Media:** Uses "TWO MODES:" section
- **Events:** Embeds in workflow explanation
- **Inconsistency:** Different header styles, different organization

#### 4. **Example Formatting**
- **Groups:** Numbered examples with labels, multiple scenarios
- **Media:** Example patterns with arrows
- **Events:** Complex structured examples
- **Actors:** No formal examples
- **Gap:** Not all tools have examples

#### 5. **FIND Tool Descriptions**
- **Actor FIND:** 300+ chars with detailed search strategies
- **Group FIND:** 300+ chars with search strategies
- **Media FIND:** 100 chars, minimal info
- **Event FIND:** No consistent description
- **Links FIND:** Not well documented
- **Issue:** Very inconsistent across entity types

#### 6. **Notes/Tips Section**
- **Actors:** "TIPS:" with bullet points
- **Groups:** "NOTES:" with bullet points
- **Media:** "NOTES:" with bullet points
- **Events:** Part of workflow
- **inconsistency:** Different header names, different detail

### Tool Registration Status

| Tool | CREATE | FIND | GET | EDIT | Status |
|---|---|---|---|---|---|
| Actors | ✓ (improved) | ✓ (good) | ✓ (minimal) | ✓ (minimal) | 50% consistent |
| Groups | ✓ (improved) | ✓ (good) | ✓ (minimal) | ✓ (minimal) | 50% consistent |
| Media | ✓ (detailed) | ✓ (minimal) | ✓ (minimal) | ✓ (minimal) | 25% consistent |
| Events | ✓ (very detailed) | ✓ (minimal) | ✓ (minimal) | ✓ (minimal) | 25% consistent |
| Links | ✓ (minimal) | ✓ (minimal) | ✓ (minimal) | ✓ (minimal) | 5% consistent |
| Areas | ✓ (minimal) | ✓ (minimal) | ✓ (minimal) | ✓ (minimal) | 5% consistent |
| Nations | ✓ (minimal) | ✓ (minimal) | ✓ (minimal) | N/A | 5% consistent |

## Proposed Standard Patterns

### Pattern 1: CREATE Tool (High Detail)
```
TITLE: Create [Entity Type]

DESCRIPTION:
[Brief one-liner about what tool does]

[IF APPLICABLE: CRITICAL WORKFLOW section with numbering]

REQUIRED FIELDS:
- field1: Description
- field2: Description

OPTIONAL CONFIGURATION (in config):
[List with defaults if applicable]

EXAMPLES:
1. Minimal example
2. Detailed example with more fields

TIPS/NOTES:
- Important point
- Common use case
```

### Pattern 2: FIND Tool (Medium Detail)
```
TITLE: Find [Entity Type]

DESCRIPTION:
[One sentence about searching]

SEARCH STRATEGY:
[Examples of search variations]

TIPS:
- Search multiple times
- Try acronyms
- Try partial names
- Always search before creating
```

### Pattern 3: GET Tool (Low Detail)
```
TITLE: Get [Entity Type]

DESCRIPTION:
[One sentence: retrieves entity by ID or returns structured format]
```

### Pattern 4: EDIT Tool (Medium Detail)
```
TITLE: Edit [Entity Type]

DESCRIPTION:
[One sentence about updating]

PARAMETERS:
- id: Required
- [other fields]: Only include to update

TIPS:
- Only provide fields to change
- null clears field
- arrays: null clears, [] empties
```

## Priority O Standardization

### Phase 6a: High Priority (User-Facing)
1. **CREATE Tools** - Most used, need best examples
   - [ ] CREATE_ACTOR
   - [ ] CREATE_GROUP
   - [ ] CREATE_MEDIA
   - [ ] CREATE_EVENT (unified)
   - [ ] CREATE_LINK
   - [ ] CREATE_AREA

2. **FIND Tools** - Gateway tools, need consistent guidance
   - [ ] FIND_ACTORS
   - [ ] FIND_GROUPS
   - [ ] FIND_MEDIA
   - [ ] FIND_EVENTS
   - [ ] FIND_LINKS
   - [ ] FIND_AREAS

### Phase 6b: Medium Priority
3. **GET Tools** - Simple, standardize briefly
4. **EDIT Tools** - Important but less used

### Phase 6c: Low Priority
5. **Nations Tools** - Simpler data set

## Implementation Strategy

1. **Week 1:** Apply patterns to CREATE and FIND tools
2. **Validation:** Run tests, verify LLM usability
3. **Documentation:** Create styling guide
4. **Review:** Partner review for consistency

## Expected Outcomes

- ✓ Consistent description format across all tools
- ✓ Standardized parameter documentation
- ✓ All CREATE tools have 2+ examples
- ✓ All FIND tools emphasize search strategy
- ✓ Predictable tool experience for LLM agents
- ✓ Reduced agent confusion/retry loops

---

**Next Step:** Begin Phase 6a - Standardize CREATE and FIND tools
**Estimated Time:** 4-6 hours
**Files to Modify:** 6 tool registration files

