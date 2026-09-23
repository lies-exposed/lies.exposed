---
name: dossier
description: Compile a research dossier on an actor or group — platform record, events, memberships, money flows, then web research to fill gaps; read-only report
triggers: [dossier, profile, report, who is, background, overview, everything about, investigate, research on, connections]
---

# Dossier

Read-only: do not create or edit records unless the user asks afterwards.

## 1. Platform record (if you have `liexp_cli`)

```
liexp_cli("actor list --fullName=<name>")          # or group list --query=<name>
liexp_cli("actor get --id=<uuid>")                 # or group get
liexp_cli("event list --actors=<uuid> --end=50")   # or --groups=<uuid>
liexp_cli("event list --actors=<uuid> --type=Transaction --end=50")
```
For groups also read the members; for actors, the groups they belong to.

## 2. Web research for gaps

`searchWeb` + `webScraping` for: role/career timeline, affiliations and board seats, funding received/given, legal cases, notable statements. Prefer primary sources (registries, filings, court records). Mark each web fact with its URL.

## 3. Output

```
## <Name> — dossier
**Summary** — 2–3 sentences.
**Affiliations** — groups/roles with dates (platform UUIDs where present).
**Timeline** — dated events, oldest first; platform events marked with their UUID, web-only facts with their URL.
**Money** — transactions in/out, totals by currency (see money-trail for deep dives).
**Disputed / open questions** — conflicting accounts, missing data.
**Not yet on the platform** — facts/entities worth adding.
```

Offer to add the "not yet on the platform" items (via `event-create`, `actor-profile`, `group-profile`).
