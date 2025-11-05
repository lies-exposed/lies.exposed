# PGlite Test Infrastructure - Quick Reference

**Full Documentation**: See `PGLITE_MIGRATION_COMPLETE.md`

---

## TL;DR

- **Performance**: 81% faster (144s → 27.5s)
- **Isolation**: Transaction-based rollback
- **Dependencies**: Zero external services
- **Status**: Production-ready

---

## Writing Tests

```typescript
import { GetAppTest, type AppTest } from "../../../test/AppTest.js";

describe("My Feature", () => {
  let Test: AppTest;

  beforeAll(async () => {
    Test = await GetAppTest();  // Initialize once
  });

  test("My test", async () => {
    // Create data
    const user = await Test.ctx.db.save(UserEntity, [{ ... }]);
    
    // Test logic
    const response = await Test.req.post("/api/endpoint").send({ ... });
    
    // Assertions
    expect(response.status).toEqual(200);
    
    // No cleanup needed - transaction rolls back automatically
  });

  afterAll(async () => {
    // No cleanup needed!
  });
});
```

---

## Key Rules

1. ✅ Create all data **within each test**
2. ✅ Use `beforeAll` only for context initialization
3. ❌ Don't rely on data from previous tests
4. ❌ Don't clean up in `afterAll` (transaction handles it)
5. ❌ Never compile test files (delete `.js` files if found)

---

## Common Issues

| Problem | Solution |
|---------|----------|
| "Empty criteria not allowed" | Remove `afterAll` cleanup |
| Test 2 doesn't see Test 1 data | Each test creates its own data |
| "Cannot read properties of undefined" | Delete `.js` files in `test/` |
| Tests slow (>5s each) | Set `isolate: false` in Vitest config |

---

## Configuration

### vitest.config.e2e.ts
```typescript
export default defineConfig({
  test: {
    pool: "forks",
    isolate: false,  // ← CRITICAL
    setupFiles: ["test/testSetup.ts"],
  },
});
```

---

## Architecture

```
Worker → PGlite Instance (cached)
  ├─ beforeAll: Initialize context
  ├─ beforeEach: Start transaction
  ├─ test: Run with transactional DB
  └─ afterEach: Rollback (~1-5ms)
```

---

## Files

- `test/utils/pglite-datasource.ts` - Core implementation
- `test/testSetup.ts` - Lifecycle hooks
- `test/AppTest.ts` - Context management
- `docs/testing/PGLITE_MIGRATION_COMPLETE.md` - Full guide

---

## Performance

| Metric | Value |
|--------|-------|
| Test Files | 82 passed |
| Tests | 190 passed |
| Duration | 27.5s |
| Improvement | 81% faster |
| Rollback | 1-5ms per test |

---

**Status**: 🏆 Production-Ready

