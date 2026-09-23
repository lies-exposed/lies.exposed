---
name: event-update-from-source
description: Update an existing event (or its actors/groups) with information from a new source — diff against current data, apply only supported changes, attach the source
triggers: [update event, edit event, correct, fix event, new information, new source, amend, add source to event, update from url]
agents: [auto, platform]
---

# Event Update From Source

## 1. Load the current event

`liexp_cli("event get --id=<uuid>")`. Note its `type` — edits use the typed command: `event <death|quote|transaction|scientific-study|book|patent|documentary|uncategorized> edit --id=<uuid> ...`.

## 2. Read the new source

Save/reuse the link (`link list --query=...` / `link create --url=...`), then `webScraping` it.

## 3. Diff

List each field where the source differs from or adds to the event: date, title, excerpt, participants, amounts, location.
- **Adds** missing data → apply.
- **Contradicts** existing data → apply only if the new source is stronger (primary document, court record, official filing) — otherwise report the conflict and leave the field.
- Never remove existing actors, groups or links because one source doesn't mention them.

## 4. Apply

Edit semantics: omitted flags keep current values; array flags (`--links`, `--media`, `--keywords`, `--actors`, `--groups`, …) **replace** the list — always pass existing UUIDs **plus** the new ones.
```
liexp_cli("event uncategorized edit --id=<uuid> --links=<existing...>,<new-link-uuid> --excerpt=<updated text>")
```

Participants that are new to the platform → `actor-profile` / `group-profile`. Their own records (bio, dates) may be updated the same way with `actor edit` / `group edit`.

## 5. Report

A before → after list of changed fields, conflicts left untouched, and the attached link UUID.
