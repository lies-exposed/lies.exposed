# HOM-1270 — Add tests for untested utility files

## Summary

Added unit tests for 11 utility files in `@liexp/shared/src/utils/` that previously had no test coverage.

## Files Changed (11 new test files)

| Source File | Test File | Tests |
|---|---|---|
| `APIError.utils.ts` | `APIError.utils.spec.ts` | 18 tests |
| `ByGroupOrActorUtils.ts` | `ByGroupOrActorUtils.spec.ts` | 1 test |
| `asset.utils.ts` | `asset.utils.spec.ts` | 1 test |
| `defaultSites.ts` | `defaultSites.spec.ts` | 2 tests |
| `env.utils.ts` | `env.utils.spec.ts` | 5 tests |
| `isServer.ts` | `isServer.spec.ts` | 2 tests |
| `media.utils.ts` | `media.utils.spec.ts` | 2 tests |
| `promise.utils.ts` | `promise.utils.spec.ts` | 6 tests |
| `string.utils.ts` | `string.utils.spec.ts` | 5 tests |
| `structured-output.utils.ts` | `structured-output.utils.spec.ts` | 5 tests |
| `throwValidationErrors.ts` | `throwValidationErrors.spec.ts` | 2 tests |

## Test Results

```
Test Files  39 passed (39)
Tests       581 passed (581)
```

All tests pass. No existing tests were modified.

## Risk Assessment

**Low risk** — only adds new test files, no changes to production code.
