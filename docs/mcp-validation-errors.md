# MCP Tool Validation Error Guide

This guide helps you understand and fix common validation errors when using MCP tools.

## Common Validation Errors

### ❌ Nested Object Structure Errors

#### Error: `type is required` or `type field missing`

**What happened:**
```json
{
  "authors": [
    {"id": "actor-uuid-1"}  // Missing 'type' field
  ]
}
```

**Fix:**
```json
{
  "authors": [
    {"type": "Actor", "id": "actor-uuid-1"}  // Add 'type' field
  ]
}
```

**Correct Format:**
```typescript
{"type": "Actor" | "Group", "id": "uuid-string"}
```

---

#### Error: `type must be "Actor" or "Group"` 

**What happened:**
```json
{
  "authors": [
    {"type": "actor", "id": "actor-uuid-1"}  // lowercase 'actor'
  ]
}
```

**Fix:**
```json
{
  "authors": [
    {"type": "Actor", "id": "actor-uuid-1"}  // Use uppercase
  ]
}
```

**Format Guide:**
- ✅ Correct: `"Actor"`, `"Group"` (capitalized)
- ❌ Wrong: `"actor"`, `"group"` (lowercase)
- ❌ Wrong: `"person"`, `"organization"` (different words)

---

#### Error: `id is required` or `id missing`

**What happened:**
```json
{
  "publisher": {"type": "Group"}  // Missing 'id' field
}
```

**Fix:**
```json
{
  "publisher": {"type": "Group", "id": "group-uuid-1"}
}
```

**Example Valid UUID:**
```
550e8400-e29b-41d4-a716-446655440000
```

---

#### Error: `Array format for authors/owners`

**What happened:**
```json
{
  "authors": "author-uuid-1"  // String instead of array
}
```

Or:
```json
{
  "authors": ["uuid1", "uuid2"]  // Array of UUIDs instead of objects
}
```

**Fix:**
```json
{
  "authors": [
    {"type": "Actor", "id": "uuid1"},
    {"type": "Actor", "id": "uuid2"}
  ]
}
```

---

### ❌ Date Format Errors

#### Error: `Invalid date format`

**What happened:**
```json
{
  "date": "01/15/2024"  // Slashes instead of hyphens
}
```

Or:
```json
{
  "date": "2024-1-15"  // Single digit month/day
}
```

**Fix:**
```json
{
  "date": "2024-01-15"  // YYYY-MM-DD format with hyphens
}
```

**Format Guide:**
- ✅ Correct: `"2024-01-15"` (ISO format YYYY-MM-DD)
- ✅ Correct: `"2024-12-31"`
- ❌ Wrong: `"01/15/2024"` (slashes)
- ❌ Wrong: `"2024-1-15"` (single digit month)
- ❌ Wrong: `"15-01-2024"` (wrong order)

---

### ❌ Color Format Errors

#### Error: `Invalid hex color format`

**What happened:**
```json
{
  "color": "#FF5733"  // Includes # symbol
}
```

Or:
```json
{
  "color": "FF57"  // Too short
}
```

**Fix:**
```json
{
  "color": "FF5733"  // 6 hex characters without #
}
```

**Format Guide:**
- ✅ Correct: `"FF5733"` (6 hex chars, no #)
- ✅ Correct: `"0084FF"`
- ❌ Wrong: `"#FF5733"` (includes #)
- ❌ Wrong: `"FF57"` (too short)
- ❌ Wrong: `"FF57339"` (too long)

**Valid Hex Characters:** 0-9, A-F (case-insensitive)

---

### ❌ UUID Format Errors

#### Error: `Invalid UUID format`

**What happened:**
```json
{
  "id": "not-a-uuid"
}
```

Or:
```json
{
  "id": "550e8400e29b41d4a716446655440000"  // Missing hyphens
}
```

**Fix:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**UUID Format:**
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
^        ^    ^    ^    ^
8 hex    4    4    4    12 hex chars
```

**Source of UUIDs:**
- **Search Results**: Get UUID from `findActors`, `findGroups`, `findMedia`
- **Never Guess**: Do not create or invent UUIDs
- **Copy Exactly**: Copy the exact UUID from search results

---

### ❌ Empty/Null Array Errors

#### Error: `Array is empty when required`

**What happened:**
```json
{
  "actors": [],  // Empty when tool expects at least one
  "groups": []
}
```

**Solutions:**

If entities not found in search:
- ✅ It's OK to leave empty arrays for optional fields
- ✅ Some tools allow empty actors/groups
- ❌ Some tools require at least one entry

Check tool description for requirements.

**Workaround:**
- Search more thoroughly with different name variations
- If truly no match exists, empty arrays are acceptable per tool design

---

#### Error: `Value cannot be null` when null provided

**What happened:**
```json
{
  "pdfMediaId": null  // Field requires a UUID
}
```

**Fix:**
```json
{
  "pdfMediaId": "media-uuid-1"  // Provide actual UUID
}
```

Or check tool docs to see if field is actually optional:
```json
{
  "audioMediaId": null  // This one is allowed to be null
}
```

---

### ❌ Type/Length Errors

#### Error: String expected but got number

**What happened:**
```json
{
  "title": 123,  // Number instead of string
  "date": 2024  // Number instead of string
}
```

**Fix:**
```json
{
  "title": "123",  // Convert to string
  "date": "2024-01-15"
}
```

---

#### Error: Array element validation failed

**What happened:**
```json
{
  "media": ["uuid1", "uuid2", 123]  // Last element is number
}
```

**Fix:**
```json
{
  "media": ["uuid1", "uuid2", "uuid3"]  // All strings
}
```

---

## 🔍 Debugging Checklist

When validation fails:

- [ ] Does error message mention a specific field? Check that field first
- [ ] Are nested objects formatted correctly? Check `type` and `id` fields
- [ ] Are dates in YYYY-MM-DD format?
- [ ] Are colors 6-char hex without #?
- [ ] Are UUIDs in correct format with hyphens?
- [ ] Are arrays properly formatted `[...]` not strings?
- [ ] Copy UUIDs directly from search results (don't type by hand)

---

## 📋 Field Validation Quick Reference

| Field | Format | Example | Valid Values |
|-------|--------|---------|--------------|
| date | YYYY-MM-DD | "2024-01-15" | ISO format with hyphens |
| color | Hex (no #) | "FF5733" | 6 hex characters |
| UUID | With hyphens | "550e8400-e29b-41d4-a716-446655440000" | v4 UUID format |
| type | String | "Actor" | "Actor" or "Group" (capitalized) |
| array | [objects] | [{"type": "Actor", "id": "uuid"}] | Array of objects |
| string | Text | "Hello World" | Plain text |
| number | Integer | 1500000 | Numeric value |
| boolean | true/false | true | true or false |

---

## 🎯 Common Nested Object Patterns

### Pattern 1: Single nested object with type
```json
{
  "publisher": {
    "type": "Group",
    "id": "group-uuid"
  }
}
```

### Pattern 2: Array of nested objects
```json
{
  "authors": [
    {"type": "Actor", "id": "actor-uuid-1"},
    {"type": "Group", "id": "group-uuid-1"}
  ]
}
```

### Pattern 3: Optional null value
```json
{
  "audioMediaId": null,
  "publisher": null
}
```

---

## 🆘 Still Getting Errors?

If error persists after checking this guide:

1. **Re-read the error message carefully** - Look for the specific field name
2. **Check the example in tool description** - Compare your data structure
3. **Simplify your input** - Try with minimal required fields only
4. **Search for existing entities** - Don't create when match might exist
5. **Copy values from search results** - Don't type or guess UUIDs

Remember: "Copy-paste from search results" is the safest approach for IDs!

---

## 📝 Template Responses

When you get validation errors, use these templates:

### Template 1: Fixing nested objects
```
The error indicates the 'authors' field has incorrect structure.
Should be: [{"type": "Actor", "id": "uuid"}]
Not: ["uuid"] or [{"id": "uuid"}]

Let me search for author IDs first, then create the event with correct format.
```

### Template 2: Invalid UUID source
```
I got the UUID from search results, but let me verify the format.
UUIDs should be in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

Let me search again to confirm the ID format.
```

### Template 3: Date format issue  
```
The date format should be YYYY-MM-DD (e.g., "2024-01-15").
Let me correct the format and try again.
```
