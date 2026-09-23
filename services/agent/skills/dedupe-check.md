---
name: dedupe-check
description: Find likely duplicate actors, groups, events or links (spelling variants, aliases, acronyms, same URL) and report them — the CLI has no merge, so report only
triggers: [duplicate, duplicates, dedupe, deduplicate, same person, same group, twice, double, merge, variants, alias]
agents: [auto, platform]
---

# Dedupe Check

Report only — there is no merge command. Never delete or rename records to "fix" duplicates.

## 1. Generate variants

For a name: full name, surname only, without middle names/titles, native spelling, transliterations, acronym ↔ expansion, with/without legal suffix (Inc, Ltd, SpA, GmbH), "The …".

## 2. Search each variant

```
liexp_cli("actor list --fullName=<variant> --end=20")
liexp_cli("group list --query=<variant> --end=20")
liexp_cli("event list --query=<keywords> --startDate=<d-7> --endDate=<d+7> --end=20")
liexp_cli("link list --query=<domain or path fragment> --end=20")
```

## 3. Compare candidates

`get` each candidate. Same entity when most of these agree: dates (born/founded), nationality, memberships, excerpt, avatar. Links: same URL ignoring `www`, trailing slash, tracking params (`utm_*`). Events: same date ± a few days, same participants, same type.

## 4. Report

For each cluster: UUIDs, why they look like the same entity, which one is more complete (suggested keeper), and what the other has that the keeper lacks. Suggest the user merges them in the admin; offer to copy missing fields onto the keeper (after confirmation).
