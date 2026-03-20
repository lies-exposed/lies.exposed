# Backend Test Coverage Analysis

## Executive Summary

This document analyzes the current test coverage of the `@liexp/backend` package and outlines a strategy to reach the 50% coverage threshold.

### Current Coverage Status

| Metric | Current | Threshold | Gap |
|--------|---------|-----------|-----|
| Statements | ~38.14% | 50% | -11.86% |
| Functions | ~34.79% | 50% | -15.21% |
| Lines | ~38.77% | 50% | -11.23% |

**Gap to close: ~600-700 uncovered statements**

---

## Tests Added

### New Test Files (5 files, 45 tests passing)

| File | Tests | Coverage Gain |
|------|-------|--------------|
| `src/services/agent-chat/agent-chat.service.spec.ts` | 19 | 93.93% |
| `src/flows/media/thumbnails/thumbnailResize.flow.spec.ts` | 3 | 100% |
| `src/flows/media/thumbnails/extractThumbnailFromImage.flow.spec.ts` | 4 | 100% |
| `src/providers/redis/RedisPubSub.spec.ts` | 9 | 100% |
| `src/providers/ai/aiMessage.helper.spec.ts` | 10 | 100% |

### Coverage Impact

The new tests significantly improved coverage for:
- `services/agent-chat/agent-chat.service.ts` - **93.93%** (was 0%)
- `providers/redis/RedisPubSub.ts` - **100%** (was 0%)
- `providers/ai/aiMessage.helper.ts` - **100%** (was 0%)
- `flows/media/thumbnails/thumbnailResize.flow.ts` - **100%** (was 0%)
- `flows/media/thumbnails/extractThumbnailFromImage.flow.ts` - **100%** (was 0%)

---

## Missing Test Areas

### Priority 1: High-Impact (Highest Statement Count)

#### A. `services/agent-chat/` (DONE)
- `agent-chat.service.ts` - **COMPLETED** ✅

#### B. `flows/ai/` (4 files, ~130 statements)

| File | Lines | Est. Gain |
|------|-------|-----------|
| `updateEventFromDocuments.flow.ts` | 55 | ~25 |
| `runRagChain.ts` | 65 | ~35 |
| `createEventFromDocuments.flow.ts` | 43 | ~20 |
| `createEventFromText.flow.ts` | 38 | ~12 |

**Dependencies:** `LangchainContext`, `LoggerContext`, `AgentChatService`

#### C. `flows/admin/nlp/` (5 files, ~310 statements)

| File | Lines | Est. Gain |
|------|-------|-----------|
| `extractEntitiesFromAny.flow.ts` | 220 | ~60 |
| `extractRelationsFromText.flow.ts` | 123 | ~40 |
| `upsertEntities.flow.ts` | 140 | ~35 |
| `extractRelationsFromPDF.flow.ts` | 66 | ~20 |
| `extractRelationsFromURL.flow.ts` | 70 | ~20 |

**Dependencies:** 5-7 context providers per file

### Priority 2: Medium-Impact

#### D. `providers/ai/` (7 files, ~640 statements)

| File | Lines | Est. Gain |
|------|-------|-----------|
| `agent.factory.ts` | 498 | ~80 |
| `webScraping.tools.ts` | 476 | ~60 |
| `langchain.provider.ts` | 223 | ~40 |
| `VanillaPuppeteerWebLoader.ts` | 164 | ~30 |
| `agent.provider.ts` | 154 | ~30 |
| `searchWeb.tools.ts` | 93 | ~20 |
| `aiMessage.helper.ts` | 81 | ~15 |

**Status:** `aiMessage.helper.spec.ts` - **COMPLETED** ✅

#### E. `flows/media/thumbnails/` (7 files, ~230 statements)

| File | Lines | Est. Gain | Status |
|------|-------|-----------|--------|
| `extractThumbnailFromVideoPlatform.flow.ts` | 194 | ~50 | Pending |
| `extractMP4Thumbnail.flow.ts` | 138 | ~40 | Pending |
| `extractThumbnail.flow.ts` | 101 | ~30 | Pending |
| `extractThumbnailFromPDF.flow.ts` | 79 | ~25 | Pending |
| `generateThumbnails.flow.ts` | 77 | ~20 | Pending |
| `createThumbnail.flow.ts` | 54 | ~15 | Pending |
| `thumbnailResize.flow.ts` | 26 | ~8 | **COMPLETED** ✅ |
| `extractThumbnailFromImage.flow.ts` | 22 | ~10 | **COMPLETED** ✅ |

### Priority 3: Lower-Impact (Simple Files)

#### F. `pubsub/` (15 files, ~120 statements)

| File | Lines | Est. Gain |
|------|-------|-----------|
| `media/transferFromExternalProvider.pubSub.ts` | 16 | ~10 |
| `events/createEventFromURL.pubSub.ts` | 17 | ~12 |
| `media/createThumbnail.pubSub.ts` | 18 | ~12 |
| `jobs/processJobDone.pubSub.ts` | 18 | ~12 |
| `stats/createEntityStats.pubSub.ts` | 16 | ~10 |
| `buildImageWithSharp.pubSub.ts` | 14 | ~8 |
| `searchFromWikipedia.pubSub.ts` | 14 | ~8 |
| `postToSocialPlatforms.pubSub.ts` | 11 | ~6 |
| `links/searchLinks.pubSub.ts` | 10 | ~6 |
| `links/takeLinkScreenshot.pubSub.ts` | 12 | ~6 |
| `media/generateThumbnail.pubSub.ts` | 8 | ~4 |
| `media/extractMediaExtra.pubSub.ts` | 8 | ~4 |
| `nlp/extractEntitiesWithNLP.pubSub.ts` | 8 | ~4 |

**Status:** `RedisPubSub.spec.ts` - **COMPLETED** ✅

#### G. Remaining Providers (10 files, ~80 statements)

| File | Est. Gain |
|------|-----------|
| `providers/brave.provider.ts` | ~10 |
| `providers/ig/ig.provider.ts` | ~8 |
| `providers/m2mToken.provider.ts` | ~8 |
| `providers/ner/ner.provider.ts` | ~10 |
| `providers/puppeteer.provider.ts` | ~10 |
| `providers/queue.provider.ts` | ~8 |
| `providers/redis/RedisPubSub.ts` | **COMPLETED** ✅ |
| `providers/redis/Subscriber.ts` | ~8 |
| `providers/sentry.provider.ts` | ~5 |
| `providers/wikipedia/wikipedia.provider.ts` | ~8 |

---

## Implementation Order Summary

| Phase | Files | Est. Statements | Cumulative |
|-------|-------|----------------|------------|
| 1 (Completed) | 5 | ~120 | 120 |
| 2 | 12 | ~250 | 370 |
| 3 | 48 | ~200 | 570 |
| **Total** | **65** | **~570** | **+48 buffer** |

---

## Testing Patterns

### Mock Context Pattern

```typescript
const createMockContext = () => {
  const logger = {
    info: { log: vi.fn() },
    debug: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
    extend: vi.fn().mockReturnThis(),
  };

  const http = {
    get: vi.fn().mockReturnValue(TE.right(data)),
    post: vi.fn(),
  };

  return { logger, http };
};
```

### TaskEither Testing

```typescript
import { pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";

// Test success case
const result = await pipe(
  myFlow(params)(ctx as any),
  throwTE,
);
expect(result).toEqual(expected);

// Test error case
const result = await myFlow(params)(ctx as any)();
expect(result._tag).toBe("Left");
```

### FP TaskEither Mock Helper

```typescript
import * as TE from "fp-ts/lib/TaskEither.js";

// Simple mock
ctx.db.findOne.mockReturnValue(TE.right(entity));

// Mock with implementation
ctx.db.save.mockImplementation(() => TE.right([savedEntity]));
```

---

## Configuration Updates

### Coverage Exclusions

Added to `vitest.base-config.ts`:

```typescript
coverage: {
  exclude: [
    ...coverageConfigDefaults.exclude,
    "lib/**",
    "src/**/*.spec.ts",
    "src/context/index.ts",
    "src/context/*.context.ts",
    "src/flows/media/thumbnails/*.type.ts",
    "src/**/*.type.ts",
    "src/**/index.ts",
  ],
}
```

These exclusions prevent type-only files from inflating coverage metrics.

---

## Test Utilities Created

### Agent Chat Service Test Utils

Location: `src/services/agent-chat/agent-chat.service.test.utils.ts`

Provides mock context and helper functions for testing the AgentChatService.

---

## Recommendations

### 1. Quality Over Quantity
Focus on comprehensive tests for critical modules rather than shallow coverage of all files.

### 2. Context Mocking Strategy
Create shared mock utilities for common context combinations:
- Database + Logger
- HTTP + Logger
- Redis + Logger
- Full context for integration tests

### 3. Test Exclusions
Consider excluding from coverage:
- Type-only files (`.type.ts`, `index.ts`)
- Pure re-export files
- Complex integration flows requiring 10+ mocks

### 4. Threshold Adjustment
If 50% proves difficult, consider:
- Setting different thresholds for statements (45%) vs functions (40%)
- Excluding specific high-complexity directories from thresholds

---

## Verification

Run tests with coverage:

```bash
pnpm --filter @liexp/backend test run --coverage
```

Check `coverage/coverage-summary.json` for detailed metrics.

---

## Next Steps

1. **Continue with pubsub handlers** - Simple schema testing
2. **Add tests for `flows/ai/`** - High-value but complex mocking
3. **Create shared context fixtures** - Reduce test boilerplate
4. **Evaluate threshold adjustment** - If progress stalls
