---
name: implement-from-plan
description: Implement a plan from a markdown checklist file. Reads the plan, detects already-complete items, implements remaining items sequentially, updates context/ files with durable learnings, then deletes the plan file on full completion. Trigger keywords: implement plan, execute plan, work through plan, implement from plan. Arguments: $PLAN_PATH.
---

# implement-from-plan Skill

Arguments:
- `$PLAN_PATH` — path to the plan markdown file

## Procedure

1. Read `$PLAN_PATH` and extract checklist items with status (`[ ]` = todo, `[x]` = done).
2. Detect already-complete items by inspecting the codebase — mark done with file proof.
3. Implement remaining items sequentially; keep statuses current (`todo → in-progress → done → blocked`).
4. After each item, run the relevant quality check (`pnpm --filter <service> typecheck` / `lint` / `test`).
5. After all items, do a full scope validation.
6. Walk the Self-Update Rules table in `AGENTS.md` — append any durable findings to `context/`.
7. If all planned scope complete: delete `$PLAN_PATH` only. Never delete unrelated plan files.
8. If partial: keep `$PLAN_PATH` updated with current statuses and create a follow-up plan for deferred scope.

## Return

- Summary of done / blocked / deferred items
- Files changed
- Validation outcomes (lint, typecheck, tests)
- Context updates made (which files, what was appended)
- Plan delete or retain action

## Rules

- Use `pnpm --filter <service>` from repo root — never `cd` into service directories.
- Edit source files only — never `lib/` or `build/`.
- fp-ts patterns throughout — `pipe` + `TaskEither`/`ReaderTaskEither`.
- All imports use `.js` extension.
