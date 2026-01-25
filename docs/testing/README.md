# Testing Guide

This guide covers testing strategy, patterns, and best practices for the lies.exposed platform.

## Contents

- [Unit Tests](./unit-tests.md) - Unit testing patterns and mocking
- [E2E Tests](./e2e-tests.md) - API end-to-end testing
- [Test Utilities](./test-utils.md) - Helpers, factories, and mocks

## Test Types

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Focus on pure business logic
- Use vitest for fast execution

### Integration Tests

- Test service interactions
- Validate MCP server integration
- Check database operations
- Test API endpoints

### E2E Tests

- Full user journey testing
- Cross-service integration
- Performance benchmarking
- Load testing critical paths

## Running Tests

```bash
# All tests in a package
pnpm --filter api test

# Unit tests only
pnpm --filter api test:spec

# E2E tests only
pnpm --filter api test:e2e

# All packages
pnpm -r test
```

## Testing Stack

| Tool | Purpose |
|------|---------|
| **vitest** | Test runner |
| **fast-check** | Property-based testing |
| **vitest-mock-extended** | Mocking |
| **supertest** | HTTP testing |
| **@liexp/test** | Arbitraries for test data |

## Coverage Requirements

- Minimum 80% coverage
- Critical paths 100% covered
- Document uncovered edge cases
- Regular coverage audits

## Key Principles

### Test for What SHOULD Be

```typescript
// Good: Test specific expected values
expect(response.status).toBe(200);

// Bad: Test what it's NOT
expect([401, 403]).not.toContain(response.status);
```

### Use Property-Based Testing

```typescript
import { fc } from "@liexp/test/lib/index.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";

fc.assert(
  fc.property(ActorArb, (actor) => {
    return actor.fullName.length > 0;
  })
);
```

### Generate Test Data with Arbitraries

```typescript
const [media] = fc.sample(MediaArb, 1);
const [keyword] = fc.sample(KeywordArb, 1);
```

### Use TaskEither with throwTE

```typescript
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";

const result = await pipe(
  functionUnderTest(testData)(mockCtx),
  throwTE
);
```

## Best Practices

### Do

- Use `GetAppTest()` for E2E test setup
- Create users with specific scopes
- Use arbitraries for generating test data
- Test specific HTTP status codes
- Clean up test data after tests

### Don't

- Test negative assertions (`expect().not.toBe()`)
- Use hardcoded test data
- Skip authentication testing
- Mock the HTTP layer in E2E tests
- Test implementation details
