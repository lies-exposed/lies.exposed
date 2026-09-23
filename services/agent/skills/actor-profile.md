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
liexp_cli("actor list --fullName=<full name> --end=10")
liexp_cli("actor list --fullName=<surname> --end=10")
```
Also try the name without middle names/titles and the native spelling. If a match exists, switch to **Enrich** below.

## 2. Gather facts

Use what the user or the source gives. If the user asked for a complete profile, fill gaps with `searchWeb` + `webScraping` (prefer Wikipedia, official bios, registries). Never invent dates.

Collect: full name, short excerpt (1–2 neutral sentences: role + why relevant), bornOn / diedOn (YYYY-MM-DD, only if sourced), nationalities, groups they belong to.

## 3. Avatar

`liexp_cli("actor find-avatar --fullName=<full name>")` → prints a media UUID. If it fails, continue without an avatar — do not block creation.

## 4. Nationalities

`liexp_cli("nation list --name=<country>")` → nation UUIDs.

## 5. Create

`username` is a lowercase slug of the full name (`john-doe`); add a disambiguator if taken.
```
liexp_cli("actor create --username=<slug> --fullName=<Full Name> --excerpt=<text> --avatar=<media-uuid> --bornOn=YYYY-MM-DD --nationalities=<nation-uuid,...>")
```
Omit flags you have no data for.

## Enrich an existing actor

1. `liexp_cli("actor get --id=<uuid>")` — read current values.
2. Only change fields that are empty or clearly wrong; tell the user about any value you overwrite.
3. Group membership: resolve groups with `group list --query=...` (create via `group-profile` only if the user wants), then
   `liexp_cli("actor edit --id=<uuid> --memberIn=<group-uuid,...>")`.
   Arrays **replace** the current list — merge with the existing values from `actor get` first.

## Report

Actor UUID, fields set, avatar found or not, and any fact you could not source.
