# CI/CD Workflows

<!-- LLM Quick Reference - Action Block -->
<details open>
<summary><strong>Quick Reference (for LLMs)</strong></summary>

**Workflows:**
- `pull-request.yml` - PR validation (lint, build, test per service)
- `release-please.yml` - Release automation + Docker builds

**Reusable Actions:** `install-deps`, `setup-workspace`, `build-packages`, `build-service`, `test-service`, `docker-build-push`

**Caching Strategy:** Content-based hash of source files, not `github.sha`

**Adding a Service:** Add entry to matrix in `pull-request.yml` with `lint_command`, `build_command`, `spec_command`. Set `needs_db: true` and `e2e_command` if DB required.

</details>

---

## Workflow Architecture

```
.github/
├── workflows/
│   ├── pull-request.yml       # PR validation
│   └── release-please.yml     # Release + Docker builds
└── actions/
    ├── install-deps/          # Node.js + pnpm with caching
    ├── setup-workspace/       # install-deps + build-packages
    ├── build-packages/        # Shared packages (content-based cache)
    ├── build-service/         # Service build (content-based cache)
    ├── test-service/          # Spec/e2e test runner
    └── docker-build-push/     # Docker build with GHA cache
```

## Pull Request Workflow

```
detect-changes → install → ci (matrix: 8 services, max 5 parallel)
                        ↘ knip-report
```

### Change Detection

Uses `dorny/paths-filter` to detect which services need CI:

```yaml
outputs:
  admin: ${{ steps.filter.outputs.admin }}
  api: ${{ steps.filter.outputs.api }}
  # ... per-service flags
  any-service: ${{ steps.filter.outputs.any-service }}  # Aggregate
  any-code: ${{ steps.filter.outputs.any-code }}        # Aggregate
```

### CI Matrix

Each service runs through:
1. **Lint** - `lint_command` (e.g., `pnpm api lint`)
2. **Build** - `build_command` with content-based caching
3. **Build App** - `app_command` (optional, for frontend bundles)
4. **Spec Tests** - `spec_command`
5. **Migrations** - `migration_command` (if `needs_db: true`)
6. **E2E Tests** - `e2e_command` (if present, implies DB)

### Conditional Database Services

PostgreSQL and Redis only start for services that need them:

```yaml
services:
  redis:
    image: ${{ matrix.needs_db && 'redis:7' || '' }}
  pg-db-test:
    image: ${{ matrix.needs_db && 'postgres:17' || '' }}
```

Currently `api` and `worker` have `needs_db: true`.

## Caching Strategy

### Content-Based Hashing

Caches use SHA256 hashes of source files, not `github.sha`:

```bash
# packages/**/lib cached by hash of packages/**/*.ts
HASH=$(find packages -type f \( -name "*.ts" -o -name "*.tsx" -o -name "package.json" \) \
  -not -path "*/node_modules/*" -not -path "*/lib/*" \
  | sort | xargs cat | sha256sum | cut -d' ' -f1)
```

**Why:** `github.sha` changes every commit, defeating cross-commit caching. Content-based keys hit cache when source is unchanged.

### Cache Hierarchy

```
linux-packages-{hash}              # Package builds
linux-{service}-build-{src}-{pkg}  # Service builds
linux-pnpm-store-{lock-hash}       # pnpm store
```

All caches include `restore-keys` for partial hits.

## Adding a New Service

1. Add entry to `pull-request.yml` matrix:

```yaml
- service: my-service
  enabled: ${{ needs.detect-changes.outputs.my-service == 'true' }}
  lint_command: pnpm my-service lint
  build_command: pnpm my-service build
  spec_command: pnpm my-service test
  # Optional for DB-dependent services:
  e2e_command: pnpm my-service test:e2e
  dotenv_path: "./.env.test"
  needs_db: true
```

2. Add change detection filter:

```yaml
my-service:
  - ".github/workflows/**"
  - "packages/@liexp/core/src/**"
  - "packages/@liexp/shared/src/**"
  - "services/my-service/**"
```

3. If releasing Docker images, add to `release-please.yml` deploy matrix.

## Release Workflow

```
release-please → setup → storybook + deploy (matrix: 6 services)
```

### Docker Layer Caching

Uses GitHub Actions cache for layers:

```yaml
- uses: docker/build-push-action@v6
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

## Lessons Learned

### What Worked

| Optimization | Impact |
|--------------|--------|
| Content-based caching | Cache hits across commits when source unchanged |
| Conditional DB services | ~5 min saved (no DB startup for 6/8 services) |
| Docker layer caching | 50-60% faster release builds |
| Matrix parallelization (3→5) | ~33% faster PR CI |

### What Didn't Work

**Parallel Pipelines (lint → build → test as separate jobs)**

Tried splitting into 34 separate jobs across stages. Issues:
- Job startup overhead (~30-40s × 34 jobs)
- Sequential stage dependencies
- Worse for common case (single-service changes)

| Scenario | Single `ci` Job | Parallel Pipelines |
|----------|-----------------|-------------------|
| Change to one service | ~5-8 min | ~8-12 min (wait for all stages) |
| Change to all packages | ~15-20 min | ~10-15 min |

The current single `ci` matrix job is simpler and faster for typical changes.

## Future Improvements

### Security

1. **Pin action versions to SHA** instead of tags:
   ```yaml
   - uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11 # v4.1.1
   ```

2. **Add CODEOWNERS** for workflow files:
   ```
   # .github/CODEOWNERS
   /.github/ @platform-team
   ```

### Monitoring

1. Add workflow timing annotations for performance tracking
2. Set up GitHub Actions insights to identify slow jobs
3. Configure notifications for failed workflows

## Performance Tips

1. **pnpm aliases** - Use `pnpm api lint` instead of `pnpm --filter api lint`
2. **Partial cache hits** - `restore-keys` allow using stale cache then rebuilding only changes
3. **Skip unchanged** - Matrix entries only run when `enabled` is true
4. **Fail fast disabled** - One service failure doesn't block others
