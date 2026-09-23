---
name: event-from-sources
description: Build one event from several links or a block of text — merge facts across sources, pick the date, resolve participants, cite every source
triggers: [sources, multiple links, several articles, from text, from these links, combine, merge, build event, reconstruct]
agents: [auto, platform]
---

# Event From Sources

Use when the user gives several URLs/link UUIDs or pasted text and wants **one** event out of them. (For a single URL, `link-ingest` is enough.)

## 1. Collect sources

- URLs → `link list --query=<domain/title>` to reuse, else `link create --url=<url>`. Keep every link UUID.
- Link UUIDs → `link get --id=<uuid>` for the URL, then `webScraping` it.
- Pasted text → treat as a source; if it names its origin, find and save that URL too.

## 2. Build a fact table (in your head, not in output)

For each source note: date of the event, participants, amounts/quotes, location. Then:
- **Agreed facts** — stated by 2+ sources, or by a primary source → use.
- **Single-source facts** — use, but mark the event `--draft=true` unless the source is primary.
- **Conflicting facts** (dates, amounts, who did what) → do not pick silently; mention the conflict in the excerpt or ask the user.

Date = when it happened. If only a month/year is known, use the first day and say so in the excerpt.

## 3. Resolve participants

Actors/groups via `actor-profile` / `group-profile` dedupe rules. Area via `area list --query=...`.

## 4. Create

Load `event-create` for the type table and required flags, then create the event with **all** collected link UUIDs in `--links`.

## 5. Report

Event UUID and type, which sources supported which facts, open conflicts, and whether it was created as draft.
