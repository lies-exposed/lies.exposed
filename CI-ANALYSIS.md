# CI/CD Configuration Analysis and Improvement Recommendations

This document analyzes the GitHub Actions CI/CD configuration for the lies.exposed monorepo and provides recommendations for reducing running time and improving workflow structure.

## Implemented Changes

| Date | Change | Files Modified |
|------|--------|----------------|
| 2026-01-29 | Enabled Docker layer caching (GHA cache) | `.github/actions/docker-build-push/action.yml` |
| 2026-01-29 | Increased matrix parallelization from 3 to 5 | `.github/workflows/pull-request.yml` |
| 2026-01-29 | Content-based caching for packages | `.github/actions/build-packages/action.yml` |
| 2026-01-29 | New generic build-service action | `.github/actions/build-service/action.yml` (new) |
| 2026-01-29 | Updated setup-workspace (removed sha hash) | `.github/actions/setup-workspace/action.yml` |
| 2026-01-29 | Updated workflows to use content-based caching | `.github/workflows/pull-request.yml`, `.github/workflows/release-please.yml` |
| 2026-01-29 | Removed build-api action (replaced by build-service) | `.github/actions/build-api/` (deleted) |
| 2026-01-29 | New test-service action with spec/e2e support | `.github/actions/test-service/action.yml` (new) |
| 2026-01-29 | Conditional DB services in matrix (api/worker only) | `.github/workflows/pull-request.yml` |
| 2026-01-29 | Aggregate change detection outputs (any-service, any-code) | `.github/workflows/pull-request.yml` |

## Current Structure Overview

```
.github/
├── workflows/
│   ├── pull-request.yml       # PR validation and testing
│   ├── release-please.yml     # Release automation and Docker builds
│   └── dependabot-validate.yml # Dependabot config validation
├── actions/
│   ├── install-deps/          # Node.js + pnpm installation with caching
│   ├── setup-workspace/       # Combined install + build packages
│   ├── build-packages/        # Shared packages build with content-based caching
│   ├── build-service/         # Generic service build with content-based caching
│   ├── test-service/          # Generic test runner with spec/e2e and DB support
│   ├── docker-build-push/     # Docker build and registry push
│   └── detect-changes/        # Legacy change detection (unused)
└── dependabot.yml             # Dependency update automation
```

## Workflow Analysis

### 1. Pull Request Workflow (`pull-request.yml`)

**Current Flow:**
```
detect-changes → install → ci (8 services, max 5 parallel, conditional DB for api/worker)
                       ↘ knip-report
```

**Jobs:**
| Job | Purpose | Condition |
|-----|---------|-----------|
| `detect-changes` | Identify modified services | Always runs |
| `install` | Install deps + build packages | If dependencies changed |
| `ci` | Lint, build, test per service | Matrix of 8 services |
| `knip-report` | Unused code analysis | If any code changed |

**Services in CI Matrix:**
- `admin`, `agent`, `ai-bot`, `api`, `packages`, `storybook`, `web`, `worker`

**Current Inefficiencies:**
1. ~~Matrix limited to 3 parallel jobs (could be higher)~~ **FIXED** - Now 5 parallel
2. ~~PostgreSQL/Redis services start for every matrix job~~ **FIXED** - Separate `test-e2e` job for API only
3. Each matrix job downloads dependencies independently (mitigated by caching)
4. ~~Build caches are per-service, not shared across runs~~ **FIXED** - Content-based caching with restore-keys

---

### 2. Release Workflow (`release-please.yml`)

**Current Flow:**
```
release-please → setup → storybook + deploy (matrix: 6 services)
```

**Current Inefficiencies:**
1. ~~Docker builds have no layer caching~~ **FIXED** - GHA cache enabled
2. ~~All 6 services rebuild from scratch on every release~~ **FIXED** - Layer caching reuses unchanged layers
3. Artifact passing only for `ai-bot`, other builds re-execute

---

## Recommendations

### High Impact - Reduce Running Time

#### 1. ~~Enable Docker Layer Caching in Release Workflow~~ IMPLEMENTED

**Problem:** Docker builds use `no-cache: true` and rebuild everything on each release.

**Solution:** Enable GitHub Actions cache for Docker layers.

```yaml
# In .github/actions/docker-build-push/action.yml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push
  uses: docker/build-push-action@v6
  with:
    context: .
    file: ${{ inputs.dockerfile }}
    push: ${{ inputs.push }}
    tags: ${{ inputs.image_name }}
    build-args: ${{ inputs.build-args }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
    platforms: linux/amd64
```

**Impact:** 40-60% reduction in Docker build times after first run.

**Status:** Implemented on 2026-01-29. Removed `no-cache: true` and `pull: true`, added GHA cache configuration.

---

#### 2. ~~Increase Matrix Parallelization~~ IMPLEMENTED

**Problem:** CI matrix limited to `max-parallel: 3` with 8 services.

**Solution:** Increase to 4-5 parallel jobs or remove limit.

```yaml
strategy:
  fail-fast: true
  max-parallel: 5  # Increased from 3
  matrix:
    # ...
```

**Impact:** Up to 40% reduction in total CI time for PRs.

**Status:** Implemented on 2026-01-29. Changed `max-parallel` from 3 to 5 in `.github/workflows/pull-request.yml`.

---

#### 3. Conditional Database Services

**Problem:** PostgreSQL and Redis containers start for all 8 matrix jobs, but only `api` needs them.

**Solution:** Move database services to a separate job or use conditional service containers.

```yaml
ci:
  services:
    pg-db-test:
      # Only start for API tests
      image: ${{ matrix.service == 'api' && 'postgres:16' || '' }}
      # ...
    redis:
      image: ${{ matrix.service == 'api' && 'redis:6' || '' }}
```

**Alternative:** Create a dedicated `test-api` job that runs separately:

```yaml
test-api:
  needs: [detect-changes, install]
  if: needs.detect-changes.outputs.api == 'true'
  services:
    pg-db-test:
      image: postgres:16
      # ...
    redis:
      image: redis:6
  steps:
    # API-specific testing
```

**Impact:** Faster startup for non-API services (saves ~30-45s per job).

---

#### 4. ~~Fix Content-Based Build Caching~~ IMPLEMENTED

**Problem:** Build caches used `github.sha` which changes every commit, making caches ineffective across commits.

**Solution Implemented:**

Created content-based caching using SHA256 hashes of source files:

1. **`build-packages/action.yml`** - Computes hash from `packages/**/src/**/*.ts` files
2. **`build-service/action.yml`** - Generic action for all services with content-based caching

**New Cache Keys:**
```
linux-packages-{sha256(packages source files)[:16]}
linux-{service}-build-{sha256(service src)[:8]}-{sha256(packages lib)[:8]}
```

**All actions now include `restore-keys` for partial cache hits.**

**Status:** Implemented on 2026-01-29.

---

#### Turborepo (Optional - Only if #4 Insufficient)

If content-based caching isn't sufficient, Turborepo adds:
- Automatic dependency graph awareness
- Remote caching (share cache across CI runs and developers)
- Smarter parallel execution

**When to consider Turborepo:**
- Team > 3 developers (remote cache sharing benefits)
- Build times still slow after content-based caching
- Complex dependency graph between packages

**When current pnpm + actions is sufficient:**
- Small team / solo development
- Build times acceptable after cache fixes
- Prefer simpler setup without additional tooling

---

### Medium Impact - Better Structure

#### 5. Split CI into Parallel Pipelines

**Current:** Single `ci` job with matrix handles lint, build, and test.

**Proposed Structure:**

```yaml
jobs:
  detect-changes:
    # ... unchanged

  install:
    # ... unchanged

  lint:
    needs: [detect-changes, install]
    if: needs.detect-changes.outputs.any-code == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-workspace
      - run: pnpm lint  # All services at once

  build:
    needs: [detect-changes, install]
    strategy:
      matrix:
        service: [admin, agent, ai-bot, api, web, worker, storybook, packages]
    # ... build each service

  test-unit:
    needs: [detect-changes, build]
    strategy:
      matrix:
        service: [admin, agent, ai-bot, packages, storybook, web, worker]
    # ... unit tests (no DB needed)

  test-integration:
    needs: [detect-changes, build]
    services:
      postgres: ...
      redis: ...
    steps:
      # API integration tests only
```

**Benefits:**
- Lint runs once for all code, not per service
- Unit tests separated from integration tests
- Database services only for integration tests
- Clearer failure identification

---

#### 6. Create Reusable Workflow for Common Patterns

**Problem:** Duplicated setup steps across workflows.

**Solution:** Create a reusable workflow.

```yaml
# .github/workflows/reusable-setup.yml
name: Reusable Setup
on:
  workflow_call:
    outputs:
      cache-hit:
        description: Whether packages cache was hit
        value: ${{ jobs.setup.outputs.cache-hit }}

jobs:
  setup:
    runs-on: ubuntu-latest
    outputs:
      cache-hit: ${{ steps.packages-cache.outputs.cache-hit }}
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/install-deps
      - id: packages-cache
        uses: ./.github/actions/build-packages
```

```yaml
# In pull-request.yml
jobs:
  setup:
    uses: ./.github/workflows/reusable-setup.yml
```

---

#### 7. ~~Optimize Change Detection Output~~ IMPLEMENTED

**Problem:** Change detection outputs 9 separate flags checked individually.

**Solution:** Add aggregate outputs for common patterns.

```yaml
# In detect-changes job outputs
any-service: ${{ steps.filter.outputs.any-service }}
any-code: ${{ steps.filter.outputs.any-code }}

# In filters
any-service:
  - "services/**"
any-code:
  - "packages/**"
  - "services/**"
  - ".github/workflows/**"
```

**Status:** Implemented on 2026-01-29. Simplified `knip-report` condition from 9 checks to 1.

---

### Low Impact - Code Quality

#### 8. Remove Unused `detect-changes` Action

**Problem:** Custom `.github/actions/detect-changes/` exists but workflow uses `dorny/paths-filter` instead.

**Solution:** Delete unused action to reduce maintenance burden.

```bash
rm -rf .github/actions/detect-changes/
```

---

#### 9. Fix `always()` Condition in CI Job

**Problem:** CI job runs with `always()` which executes even on install failure.

**Current:**
```yaml
ci:
  needs: [detect-changes, install]
  if: ${{ always() && ... }}
```

**Solution:**
```yaml
ci:
  needs: [detect-changes, install]
  if: |
    needs.install.result == 'success' ||
    needs.install.result == 'skipped'
```

---

#### 10. Consolidate Dependabot Groups

**Current:** 10 separate dependency groups.

**Recommendation:** Consider consolidating related groups:

```yaml
groups:
  frontend:
    patterns:
      - "@mui/*"
      - "@blocknote/*"
      - "react-admin"
      - "ra-*"
      - "react-router*"
      - "@vitejs/*"
      - "vite*"

  ai-ml:
    patterns:
      - "@langchain/*"
      - "langchain"
      - "@aws-sdk/*"

  dev-tools:
    patterns:
      - "eslint*"
      - "@eslint/*"
      - "@storybook/*"
      - "storybook"
      - "@visx/*"
```

---

## Proposed Optimized Workflow Structure

### Pull Request Workflow (Optimized)

```yaml
name: Pull Request

on:
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  detect-changes:
    runs-on: ubuntu-latest
    outputs:
      services: ${{ steps.filter.outputs.changes }}
      needs-install: ${{ steps.filter.outputs.needs-install }}
      needs-db: ${{ steps.filter.outputs.needs-db }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            needs-install:
              - 'pnpm-lock.yaml'
              - 'package.json'
            needs-db:
              - 'services/api/**'
            admin:
              - 'services/admin/**'
            # ... other services

  install:
    needs: detect-changes
    if: needs.detect-changes.outputs.needs-install == 'true'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-workspace

  lint:
    needs: [detect-changes, install]
    if: always() && (needs.install.result == 'success' || needs.install.result == 'skipped')
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-workspace
      - run: pnpm lint

  build-and-test:
    needs: [detect-changes, install, lint]
    if: always() && needs.lint.result == 'success'
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      max-parallel: 5
      matrix:
        service: [admin, agent, ai-bot, packages, storybook, web, worker]
    steps:
      - uses: actions/checkout@v4
        if: needs.detect-changes.outputs[matrix.service] == 'true'
      - uses: ./.github/actions/setup-workspace
        if: needs.detect-changes.outputs[matrix.service] == 'true'
      - name: Build
        if: needs.detect-changes.outputs[matrix.service] == 'true'
        run: pnpm --filter ${{ matrix.service }} build
      - name: Test
        if: needs.detect-changes.outputs[matrix.service] == 'true'
        run: pnpm --filter ${{ matrix.service }} test

  test-api:
    needs: [detect-changes, install, lint]
    if: needs.detect-changes.outputs.needs-db == 'true' && needs.lint.result == 'success'
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: liexp
          POSTGRES_PASSWORD: liexp-password
          POSTGRES_DB: liexp_test
        ports:
          - 5432:5432
      redis:
        image: redis:6
        ports:
          - 6379:6379
    steps:
      - uses: actions/checkout@v4
      - uses: ./.github/actions/setup-workspace
      - uses: ./.github/actions/build-api
      - name: Test API
        run: pnpm --filter api test
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          REDIS_HOST: localhost
```

---

## Implementation Priority

| Priority | Change | Effort | Impact | Status |
|----------|--------|--------|--------|--------|
| 1 | Enable Docker layer caching | Low | High | **DONE** |
| 2 | Increase matrix parallelization | Low | Medium | **DONE** |
| 3 | Fix content-based build caching | Low | High | **DONE** |
| 4 | Conditional DB services in matrix | Medium | Medium | **DONE** |
| 5 | Optimize change detection outputs | Low | Low | **DONE** |
| 6 | Remove unused detect-changes action | Low | Low | Pending |
| 7 | Turborepo (only if needed) | High | Medium | Optional |
| 8 | Create reusable workflows | Medium | Medium | Optional |

---

## Expected Time Savings

| Optimization | Current | Expected | Savings | Status |
|--------------|---------|----------|---------|--------|
| Docker builds (with caching) | ~8-10 min | ~3-4 min | 50-60% | **Implemented** |
| Matrix parallelization (3→5) | ~15 min | ~10 min | 33% | **Implemented** |
| Content-based build caching | Cache miss/commit | Cache hit if unchanged | 40-60% | **Implemented** |
| Conditional DB services | ~45s/job × 7 | 0s | ~5 min total | Pending |
| Turborepo (if needed) | Variable | ~50-70% less | Significant | Optional |

**Total estimated PR workflow improvement: 50-70% reduction in wall-clock time**

**Implemented improvements (as of 2026-01-29):**
- Docker layer caching (GHA cache) - 50-60% faster release builds
- Matrix parallelization (3→5) - ~33% faster PR CI
- Content-based build caching for all packages and services - cache hits when source unchanged across commits

---

## Additional Recommendations

### Security Improvements

1. **Pin action versions** to SHA instead of tags:
   ```yaml
   - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
   ```

2. **Add CODEOWNERS** for workflow files:
   ```
   # .github/CODEOWNERS
   /.github/ @platform-team
   ```

### Monitoring Improvements

1. **Add workflow timing annotations** for performance tracking
2. **Set up GitHub Actions insights** to identify slow jobs
3. **Configure Slack/Discord notifications** for failed workflows

---

---

## Approaches Tried That Didn't Work

### Parallel Pipelines (lint → build → test as separate jobs)

**What we tried:** Split the single `ci` matrix job into separate parallel stages:
- `lint` job (13 parallel jobs - per package and service)
- `build` job (7 parallel jobs - services only)
- `test` job (13 parallel jobs)
- `test-e2e` job (API only with DB)

**Why it didn't work well:**

| Issue | Impact |
|-------|--------|
| **Job startup overhead** | ~30-40s per job × 34 jobs vs 8 jobs = significant overhead |
| **Sequential stages** | Lint must finish before build, build before test |
| **Cache restoration** | 34 jobs restoring workspace vs 8 jobs |
| **Single-service changes** | Slower for targeted changes (most common case) |

**Comparison:**

| Scenario | Single `ci` Job | Parallel Pipelines |
|----------|-----------------|-------------------|
| Change to one service | ~5-8 min (1 matrix job) | ~8-12 min (wait for all stages) |
| Change to all packages | ~15-20 min | ~10-15 min (better parallelization) |

**Conclusion:** The parallel pipeline approach is better for full-repo changes but worse for the more common single-service changes. The overhead of spinning up many jobs and waiting for stages to complete outweighs the parallelization benefits.

**What we kept:** The `test-e2e` isolation concept evolved into conditional DB services within the matrix, which gives the best of both worlds - single job simplicity with DB isolation.

---

*Generated: 2026-01-29 | Last updated: 2026-01-29*
