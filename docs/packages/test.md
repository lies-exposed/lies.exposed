# @liexp/test

**Version:** 0.1.10
**Location:** `packages/@liexp/test`

## Purpose

Provides property-based testing infrastructure using `fast-check` with arbitraries (data generators) for all domain types. Enables consistent test data generation across all services.

## Key Modules

### Main Exports

```typescript
import { fc, Media, Event, Nation, Arbs } from "@liexp/test/lib/index.js";

// fc is re-exported fast-check
// Arbs contains all arbitrary namespaces
```

### Entity Arbitraries (`src/arbitrary/`)

| Arbitrary | Type | Description |
|-----------|------|-------------|
| `ActorArb` | `http.Actor.Actor` | Random actor generation |
| `GroupArb` | `http.Group.Group` | Random group generation |
| `MediaArb` | `http.Media.Media` | Random media generation |
| `LinkArb` | `http.Link.Link` | Random link generation |
| `KeywordArb` | `http.Keyword.Keyword` | Random keyword generation |
| `AreaArb` | `http.Area.Area` | Random area generation |
| `NationArb` | `http.Nation.Nation` | Random nation generation |
| `ProjectArb` | `http.Project.Project` | Random project generation |
| `PageArb` | `http.Page.Page` | Random page generation |
| `UserArb` | `http.User.User` | Random user generation |
| `SocialPostArb` | `http.SocialPost.SocialPost` | Random social post generation |
| `GroupMemberArb` | `http.GroupMember.GroupMember` | Random membership generation |

### Event Arbitraries (`src/arbitrary/events/`)

```typescript
import { getEventArbitrary, EventTypeArb } from "@liexp/test/lib/arbitrary/events/index.arbitrary.js";

// Get arbitrary for specific event type
const uncategorizedArb = getEventArbitrary("Uncategorized");
const deathArb = getEventArbitrary("Death");
const quoteArb = getEventArbitrary("Quote");
```

| Arbitrary | Event Type |
|-----------|------------|
| `BookEventArb` | Book events |
| `DeathEventArb` | Death events |
| `DocumentaryEventArb` | Documentary events |
| `PatentEventArb` | Patent events |
| `QuoteEventArb` | Quote events |
| `ScientificStudyArb` | Scientific study events |
| `TransactionEventArb` | Transaction events |
| `UncategorizedArb` | Generic events |

### Common Arbitraries (`src/arbitrary/common/`)

| Arbitrary | Type | Description |
|-----------|------|-------------|
| `UUIDArb` | `UUID` | Valid UUID strings |
| `ColorArb` | `Color` | Hex color codes |
| `BlockNoteDocumentArb` | `BlockNoteDocument` | Rich text documents |
| `BySubjectArb` | `BySubject` | Actor or Group references |

## Usage Examples

### Basic Usage

```typescript
import { fc, Arbs } from "@liexp/test/lib/index.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";

// Generate single sample
const actor = fc.sample(ActorArb, 1)[0];

// Property-based test
fc.assert(
  fc.property(ActorArb, (actor) => {
    return actor.fullName.length > 0;
  })
);
```

### In API E2E Tests

```typescript
import { fc } from "@liexp/test/lib/index.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";

describe("Media API", () => {
  it("should create media", async () => {
    const [media] = fc.sample(MediaArb, 1);
    const [keyword] = fc.sample(KeywordArb, 1);

    const response = await Test.req
      .post("/v1/media")
      .set(authHeader)
      .send({
        ...media,
        keywords: [keyword.id],
      });

    expect(response.status).toBe(201);
  });
});
```

### In Unit Tests

```typescript
import { fc } from "@liexp/test/lib/index.js";
import { HumanReadableStringArb } from "@liexp/test/lib/arbitrary/HumanReadableString.arbitrary.js";

it("should handle all valid inputs correctly", () => {
  fc.assert(fc.property(
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.nat({ max: 1000 }),
    async (testString, testNumber) => {
      const result = await pipe(
        functionUnderTest({ text: testString, count: testNumber })(mockCtx),
        throwTE
      );

      expect(result).toBeDefined();
      expect(typeof result.id).toBe("string");
    }
  ));
});
```

## Development Commands

```bash
pnpm --filter @liexp/test build
pnpm --filter @liexp/test typecheck
pnpm --filter @liexp/test watch
```

## Related Documentation

- [Testing Guide](../testing/README.md) - Testing strategy overview
- [Unit Tests](../testing/unit-tests.md) - Unit testing patterns
- [E2E Tests](../testing/e2e-tests.md) - E2E testing patterns
- [Test Utilities](../testing/test-utils.md) - Test helper patterns
