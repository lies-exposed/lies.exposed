---
name: actor-profile
description: Create a new actor (person) or enrich an existing one — dedupe, avatar from Wikipedia, excerpt, birth/death dates, nationalities, group memberships
triggers: [actor, person, people, politician, ceo, scientist, journalist, biography, bio, avatar, born, nationality, member]
agents: [auto, platform]
---

# Actor Profile

## 1. Dedupe first — always

Search at least two variants before creating:
```
findActors({ "fullName": "<full name>", "end": 10 })
findActors({ "fullName": "<surname>", "end": 10 })
```
Also try the name without middle names/titles and the native spelling. If a match exists, switch to **Enrich** below.

## 2. Gather facts

Use what the user or the source gives. If the user asked for a complete profile, fill gaps with `searchWeb` + `webScraping` (prefer Wikipedia, official bios, registries). Never invent dates.

Collect: full name, short excerpt (1–2 neutral sentences: role + why relevant), bornOn / diedOn (YYYY-MM-DD, only if sourced), nationalities, groups they belong to.

## 3. Avatar

`find_wikipedia_image({ "name": "<full name>" })` → `{ imageUrl, type }`. Then `createMedia({ "location": "<imageUrl>", "type": "<type>", "label": "<full name>" })` and use the returned media id as the avatar. If either step fails, continue without an avatar — do not block creation.

## 4. Nationalities

Nationalities are nation UUIDs. If you have a nation lookup tool (`findNations({ "name": "<country>" })`) use it; otherwise leave `nationalities` empty and say so in the report.

## 5. Create

`username` is a lowercase slug of the full name (`john-doe`); add a disambiguator if taken.
```
createActor({ "username": "<slug>", "fullName": "<Full Name>", "color": "<hex without #>", "avatar": "<media-uuid>", "bornOn": "YYYY-MM-DD", "nationalities": ["<nation-uuid>"] })
```
`color` is required (hex without `#`). `excerpt` is a BlockNote document; if unsure of the format, create first and set the text with `editActor`. Omit fields you have no data for.

## Enrich an existing actor

1. `findActors({ "ids": ["<uuid>"] })` — read current values.
2. Only change fields that are empty or clearly wrong; tell the user about any value you overwrite.
3. Group membership: resolve groups with `findGroups({ "query": "..." })` (create via `group-profile` only if the user wants), then
   `editActor({ "id": "<uuid>", "memberIn": ["<group-uuid>", "..."] })`.
   Arrays **replace** the current list — merge with the existing values from `findActors` first.

## Report

Actor UUID, fields set, avatar found or not, and any fact you could not source.
