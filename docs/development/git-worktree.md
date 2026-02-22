# Git Worktree Development Guide

Git worktrees let you check out multiple branches simultaneously in separate directories,
which is useful for working on a feature in isolation without stashing or interrupting your
main working tree.

## Creating a worktree

```bash
# From the main repo root
git worktree add .claude/worktrees/<branch-name> <branch-name>

# Or create a new branch at the same time
git worktree add -b <new-branch> .claude/worktrees/<new-branch> main
```

### Recommended location: `.claude/worktrees/`

Place worktrees under `.claude/worktrees/` inside the repo root. This directory is already
git-ignored (Claude Code manages it) and keeps everything self-contained.

**Do not** put worktrees in:
- The repo root itself (confusing nested git state)
- A parent directory (worktree path must be outside the main working tree)
- Arbitrary paths on disk (hard to track/clean up)

## What is NOT copied into a worktree

A worktree shares the same git history and object store as the main tree, but it starts
from a clean checkout. Several files that are git-ignored will therefore be **missing**:

### `.env.local` files

Every service that needs environment variables has its own `.env.local` (or `.env`) file
that is git-ignored and lives only on disk. Examples:

```
services/api/.env.local
services/ai-bot/.env.local
services/web/.env.local
services/admin/.env.local
services/worker/.env.local
```

**These files are not available in a fresh worktree.** This means you cannot:
- Start any service (`pnpm dev`, `docker compose up`, etc.)
- Run e2e or integration tests that connect to a real DB or external service
- Use any feature that reads from `process.env` at runtime

**Workaround options:**
- Copy the files manually: `cp services/api/.env.local .claude/worktrees/<branch>/services/api/.env.local`
- Symlink from the main tree: `ln -s $(git rev-parse --show-toplevel)/services/api/.env.local services/api/.env.local`
- Limit work in the worktree to changes that do not require a running process (typechecks, lint, unit tests with mocked dependencies)

### `node_modules/`

Not duplicated — each worktree needs its own install:

```bash
cd .claude/worktrees/<branch>
pnpm install
```

Because pnpm uses a content-addressable store the install is fast (hardlinks, no re-download).

### Build outputs (`lib/`, `build/`)

Not present until you build. Run `pnpm build` or a targeted `pnpm --filter <pkg> build`
before running `typecheck` or `lint` for packages that other packages consume.

The most common missing build that causes lint/typecheck failures is:

```bash
pnpm --filter @liexp/eslint-config build
```

This package must be built before `tsc -b` can resolve it from tsconfig `references`.
All packages and services that have an `eslint.config.js` importing from `@liexp/eslint-config`
need this to be present.

## What you CAN do in a worktree without `.env.local`

- Edit source files
- Run `pnpm typecheck` (uses tsc, no runtime env needed)
- Run `pnpm lint` / `pnpm lint --fix` (after building `@liexp/eslint-config`)
- Run pure unit tests that mock all external dependencies
- Commit and push

## Cleaning up

```bash
# From the main repo root
git worktree remove .claude/worktrees/<branch-name>

# If the worktree has uncommitted changes, force-remove
git worktree remove --force .claude/worktrees/<branch-name>

# Prune stale worktree metadata
git worktree prune
```

## Tips

- Always run `git worktree list` to see all active worktrees before creating a new one.
- The worktree shares the same `.git` directory — commits, branches, and tags created inside
  a worktree are immediately visible from the main tree (and vice versa).
- You cannot check out the **same branch** in two worktrees at the same time. Git will refuse
  with `fatal: '<branch>' is already checked out`.
- If `pnpm lint --fix` fails with module-not-found errors pointing at `@liexp/eslint-config`,
  build it first: `pnpm --filter @liexp/eslint-config build`.
