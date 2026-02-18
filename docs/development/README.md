# Development Guide

This guide covers development best practices, code quality standards, and workflows for the lies.exposed platform.

## Contents

- [Code Quality](./code-quality.md) - Commit messages, code style, import organization
- [Error Handling](./error-handling.md) - IOError / APIError pipeline, backend middleware, frontend patterns
- [Functional Programming](./functional-programming.md) - fp-ts and Effect patterns
- [CI/CD Workflows](./ci-workflows.md) - GitHub Actions, caching, adding services
- [Kubernetes Access](./kubernetes.md) - Remote cluster access and debugging

## Development Priority Order

When implementing features, follow this priority:

1. **Functionality**: Ensure core logic works as expected
2. **Type Safety**: Verify all TypeScript types are correct
3. **Tests**: Write and run comprehensive tests
4. **Code Style**: Address formatting and linting issues last

## Code Organization

### Imports

- Use absolute imports from packages (e.g., `@liexp/core`)
- Include all required Effect/fp-ts imports
- Order imports: external → internal → types

### Error Handling

See [Error Handling](./error-handling.md) for the full reference.

- All internal errors extend `IOError` from `@ts-endpoint/core`
- Express middleware uses `errorHandler(ctx)` from `@liexp/backend`
- Frontend uses `toAPIError(error).message` in catch blocks — never raw `error.message`
- React components use `<ErrorBox error={error} />` or `<ErrorBoundary FallbackComponent={ErrorBox}>`

### Type Definitions

- Define and export necessary types
- Use `type` imports for type-only imports
- Prefer explicit types over inference for public APIs

## Build Output Structure

**IMPORTANT**: Always edit source files, never build outputs:
- **Packages** (`@liexp/*`): Source code in `src/`, build output in `lib/`
- **Services**: Source code in `src/`, build output in `build/`

## pnpm Workspace

This repository is a pnpm workspace (monorepo):

```bash
# Run script in specific package from repo root
pnpm --filter api run lint

# Run script with dependencies
pnpm --filter @liexp/shared... build

# Run script in all packages
pnpm -r build
```

## Critical Anti-Patterns

### Never Do

- Use `console.log` in production code (use logger instead)
- Skip error handling in async operations
- Mix imperative and functional programming styles
- Edit files in `lib/` or `build/` directories
- Use `any` type without justification
- Create side effects in pure functions
- Import from `/src/` paths in monorepo packages

### Always Do

- Use absolute imports for monorepo packages
- Include proper error handling for all operations
- Add tests for new functionality
- Update documentation for API changes
- Follow conventional commit format
- Run all quality checks before committing
- Use `type` imports for type-only imports
- Prefix unused variables with underscore

## Quality Checklist

Before every commit:

- [ ] Run `pnpm format` (Prettier)
- [ ] Run `pnpm lint` and fix all issues
- [ ] Run `pnpm typecheck` and resolve type errors
- [ ] Run `pnpm vitest` and ensure all tests pass
- [ ] Run `pnpm build` to verify compilation
