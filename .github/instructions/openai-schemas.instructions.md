---
applyTo: "**/ai/**/*.ts,**/flows/**/*.ts,**/openai/**/*.ts,**/*Schema*.ts"
---

# OpenAI Structured Output Instructions

> **Full documentation**: [docs/ai/openai-schemas.md](../../docs/ai/openai-schemas.md)

## Quick Reference (LLM Action Block)

### CRITICAL RULE
**All properties MUST be required in OpenAI structured output schemas.**

### Correct Pattern
```typescript
const Schema = Schema.Struct({
  // Required string - always present
  name: Schema.String,
  description: Schema.String,

  // Use NullOr for optional values (NOT optional/UndefinedOr)
  optionalField: Schema.NullOr(Schema.String),

  // Dates as strings with fallback instruction
  date: Schema.String.annotations({
    description: "Date in YYYY-MM-DD format or 'unknown' if not available",
  }),

  // Arrays always present (empty if none)
  tags: Schema.Array(Schema.String),
});
```

### NEVER Use These
```typescript
// ❌ ALL OF THESE WILL FAIL WITH OPENAI
Schema.optional(Schema.String)
Schema.UndefinedOr(Schema.String)
Schema.DateFromString  // Creates ZodEffects
```

### Sentinel Values for Missing Data

| Type | Fallback |
|------|----------|
| String | `"unknown"`, `"not specified"`, `"N/A"` |
| Date | `"unknown"` or empty string |
| Number | `-1`, `0` |
| Boolean | Explicit `true`/`false` |

### Complete Example
```typescript
const ActorExtractionSchema = Schema.Struct({
  fullName: Schema.String,
  bornOn: Schema.String.annotations({
    description: "Birth date YYYY-MM-DD or 'unknown'",
  }),
  diedOn: Schema.NullOr(Schema.String.annotations({
    description: "Death date YYYY-MM-DD or null if alive",
  })),
  nationality: Schema.String.annotations({
    description: "Country name or 'unknown'",
  }),
  occupations: Schema.Array(Schema.String),
}).annotations({
  title: "ActorExtraction",
  description: "Extract actor information from text",
});
```

### Debugging Checklist
If OpenAI structured output fails:
1. ☐ Check no `Schema.optional()` usage
2. ☐ Check no `Schema.UndefinedOr()` usage
3. ☐ Check no `Schema.DateFromString` usage
4. ☐ All properties have explicit types
5. ☐ Descriptions include fallback instructions
