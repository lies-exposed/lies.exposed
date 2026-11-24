---
name: event-update-from-source
description: Update an existing event (or its actors/groups) with information from a new source — diff against current data, apply only supported changes, attach the source
triggers: [update event, edit event, correct, fix event, new information, new source, amend, add source to event, update from url]
agents: [auto, platform]
---

# Event Update From Source

## 1. Load the current event

`findEvents({ "ids": ["<uuid>"] })`. Note its `type`; type-specific fields (see `event-create`) are edited through the same `editEvent` tool.

## 2. Read the new source

Save/reuse the link (`findLinks({ "query": "..." })` / `createLink({ "url": "..." })`), then `webScraping` it.

## 3. Diff

List each field where the source differs from or adds to the event: date, title, excerpt, participants, amounts, location.
- **Adds** missing data → apply.
- **Contradicts** existing data → apply only if the new source is stronger (primary document, court record, official filing) — otherwise report the conflict and leave the field.
- Never remove existing actors, groups or links because one source doesn't mention them.

## 4. Apply

Edit semantics: omitted fields keep current values; array fields (`links`, `media`, `keywords`, …) **replace** the list — always pass existing UUIDs **plus** the new ones.
```
editEvent({ "id": "<uuid>", "links": ["<existing...>", "<new-link-uuid>"], "excerpt": "<updated text>" })
```

### Scope — do only what was asked

- Resolve each participant once with its full name (`findActors` / `findGroups`); do not retry with partial names or surnames. Not found → **report it, do not create it**.
- Do **not** load `actor-profile` / `group-profile`, create actors/groups/media, or look up avatars unless the user explicitly asks for it in this request.
- Only touch the event (and attach the source link). Edit an actor/group record only if the user named it.

## 5. Report

A before → after list of changed fields, conflicts left untouched, the attached link UUID, and participants found in the source but missing from the platform (names only, not created).
