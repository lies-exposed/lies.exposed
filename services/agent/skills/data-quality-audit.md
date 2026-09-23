---
name: data-quality-audit
description: Audit a record or a batch of recent records for missing or inconsistent data (avatar, excerpt, dates, links, memberships, duplicates) and propose fixes, applying only after confirmation
triggers: [audit, quality, missing, incomplete, check record, clean up, cleanup, review data, consistency, broken, gaps in data]
agents: [auto, platform]
---

# Data Quality Audit

## 1. Scope

- One record → `<resource> get --id=<uuid>`.
- A batch → e.g. `actor list --sort=createdAt --order=DESC --end=20`, `group list --sort=createdAt --order=DESC --end=20`, `event list --end=20`, `link list --sort=createdAt --order=DESC --end=20`.

## 2. Checks

| Resource | Check |
|---|---|
| Actor | avatar, excerpt, bornOn (and diedOn if dead), nationalities, username looks like a slug |
| Group | avatar, excerpt, kind, startDate, at least one member if it's an organization with known people |
| Event | excerpt, ≥1 link as source, participants set (actors/groups/victim/from-to), date not in the future, draft events older than 30 days |
| Link | title, description, publishDate, status still `DRAFT`, not connected to any event |
| Story | body present, events linked, draft status |
| Any | probable duplicate → run the `dedupe-check` skill |

## 3. Report first

Table: record | problem | proposed fix | source for the fix. Group by severity: **wrong data** > **missing required context** > **cosmetic**.

## 4. Apply only after the user confirms

Use the relevant skill for each fix (`actor-profile`, `group-profile`, `media-attach`, `summarize-resource`, `event-update-from-source`). Remember that array flags replace lists.
