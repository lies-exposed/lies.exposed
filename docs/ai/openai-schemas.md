# OpenAI Structured Output Requirements

<!-- LLM Quick Reference - Action Block -->
<details open>
<summary><strong>Quick Reference (for LLMs)</strong></summary>

**All properties MUST be required. OpenAI does not support optional properties.**

```typescript
// ✅ CORRECT
Schema.Struct({
  name: Schema.String,
  date: Schema.String.annotations({ description: "YYYY-MM-DD or 'unknown'" }),
  optional: Schema.NullOr(Schema.String),  // Use NullOr, not optional
  tags: Schema.Array(Schema.String),       // Empty array if none
})

// ❌ NEVER USE
Schema.optional(...)
Schema.UndefinedOr(...)
Schema.DateFromString
```

**Fallbacks**: `"unknown"`, `"N/A"`, `-1`, `null`

</details>

---

**CRITICAL**: When using OpenAI's structured output feature with Zod schemas, all properties must be required. OpenAI does not support optional properties in structured output schemas.

## Schema Design Guidelines

### 1. All Properties Must Be Required

```typescript
// WRONG - Optional properties not supported by OpenAI structured output
const ActorSchema = Schema.Struct({
  name: Schema.String,
  bornOn: Schema.optional(Schema.String), // This will cause errors
  diedOn: Schema.UndefinedOr(Schema.String), // This will cause errors
});

// CORRECT - All properties required, use null for missing values
const ActorSchema = Schema.Struct({
  name: Schema.String,
  bornOn: Schema.String, // Always provide a value or "unknown"
  diedOn: Schema.NullOr(Schema.String), // Use null instead of undefined
});
```

### 2. Date Handling Best Practices

```typescript
// For string dates (recommended for structured output)
bornOn: Schema.String.annotations({
  description: "Birth date in ISO format (YYYY-MM-DD) or 'unknown' if not available",
}),

// Alternative: Use NullOr for truly optional dates
diedOn: Schema.NullOr(Schema.String.annotations({
  description: "Death date in ISO format (YYYY-MM-DD) or null if still alive",
})),
```

### 3. Array and Object Properties

```typescript
// Arrays should always be present (can be empty)
keywords: Schema.Array(Schema.String), // Returns [] if no keywords

// Objects should have all required sub-properties
address: Schema.Struct({
  street: Schema.String, // Use "unknown" or empty string if not available
  city: Schema.String,
  country: Schema.String,
}),
```

### 4. Handling Missing Information

Use descriptive fallback values:

| Type | Fallback Value |
|------|----------------|
| Strings | `"unknown"`, `"not specified"`, `"N/A"` |
| Dates | `"unknown"` or specific format |
| Numbers | `-1`, `0`, or sentinel values |
| Booleans | Explicit `true`/`false` based on context |

## Recommended Pattern for AI Flows

```typescript
const StructuredResponseSchema = Schema.Struct({
  // Always required string properties
  name: Schema.String,
  description: Schema.String,

  // Use null for truly optional values
  optionalField: Schema.NullOr(Schema.String),

  // Use sentinel values for unknown data
  unknownDate: Schema.String.annotations({
    description: "Date in YYYY-MM-DD format or 'unknown' if not available",
  }),

  // Arrays are always present (empty if no items)
  tags: Schema.Array(Schema.String),
}).annotations({
  description: "Structured response with all required fields"
});
```

## Common Anti-Patterns to Avoid

| Anti-Pattern | Why It Fails |
|--------------|--------------|
| `Schema.optional()` | OpenAI requires all properties |
| `Schema.UndefinedOr()` | Creates undefined values |
| `Schema.DateFromString` | Creates ZodEffects, not simple validation |
| Omitting properties | LLM cannot omit required fields |
| Complex transformations | Creates ZodEffects types |

## Schema Conversion

When using `effectToZodObject` for OpenAI structured output:

```typescript
const responseFormat = effectToZodObject(MySchema.fields);

// Ensure the resulting Zod schema has no optional properties
// The LLM will be forced to provide values for all fields
```

## Troubleshooting

If you encounter OpenAI structured output errors:

1. **Check schema has only required properties**
2. Verify no `Schema.optional()` or `Schema.UndefinedOr()` usage
3. Ensure dates use `Schema.String`, not `Schema.DateFromString`
4. Use `Schema.NullOr()` for truly optional values
5. Add clear descriptions with fallback value instructions
