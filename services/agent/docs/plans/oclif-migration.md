# Plan: Migrate agent service CLI to oclif

## Context

The agent service has a hand-rolled CLI (`src/cli/`) built on `makeCommand` + Effect Schema for validation and fp-ts `TaskEither` for error handling. ~40 command files cover 8 resource groups + interactive agent. `cli.ts` has deliberate error formatting (`formatError`) for `IOError` DecodingError trees and HTTP status/meta.

Home-lab has two oclif patterns (agent-kit, crypto-bot). Neither maps cleanly to this codebase without significant adaptation.

## Assessment: oclif vs existing CLI

| Feature | Existing CLI | oclif |
|---------|-------------|-------|
| Help text | Auto-generated from Effect Schema annotations (`helpFromSchema`) | Auto-generated from `Flags`/`Args` definitions |
| Arg parsing | Schema-driven: `parseArgsFromSchema` reads `--key=value` from argv, splits arrays by comma | oclif `Flags`/`Args` with type coercion |
| Validation | Effect Schema decode (type-safe, with detailed error trees) | oclif flag validation (basic type checks) |
| Error formatting | `formatError` renders IOError DecodingError trees, HTTP status/meta | `this.error()` — flat string |
| Group dispatch | Manual `switch` in `cli.ts` | oclif auto-discovery |
| Shell completions | None | oclif auto-generates |
| Test coverage | ~15 test files | Would need rewriting |

**Net value of oclif**: shell completions, `--help` polish. Everything else (schema-driven help, structured validation, error formatting) is already solved and better here.

## Recommendation

**Don't migrate.** The existing CLI already provides what oclif would add (help text, arg parsing, validation, error formatting) and does it better (Effect Schema validation with detailed error trees, deliberate `formatError` handling). oclif would be a ~40-file rewrite that loses the error formatting fix and test coverage for marginal gains in shell completions.

If shell completions are the goal, oclif can be added as a thin wrapper around the existing command structure rather than a rewrite:

### Alternative: oclif as thin wrapper (if still desired)

1. Create `bin/run.js` + `oclif` config pointing to a thin adapter layer
2. Adapter converts oclif flags → raw `string[]` → feeds existing `makeCommand`/`parseArgsFromSchema` pipeline
3. Existing `formatError` stays in `cli.ts` error path
4. No handler signature changes — `makeCommand` pattern preserved
5. Tests untouched

This keeps all existing plumbing intact while gaining oclif shell completions.
