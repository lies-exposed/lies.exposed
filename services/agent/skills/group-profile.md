---
name: group-profile
description: Create a new group (organization, company, party, agency, NGO) or enrich an existing one — dedupe, avatar, kind, dates, members
triggers: [group, organization, organisation, company, corporation, party, agency, ngo, foundation, institution, members, founded]
agents: [auto, platform]
---

# Group Profile

## 1. Dedupe first — always

```
liexp_cli("group list --query=<name> --end=10")
liexp_cli("group list --query=<acronym or short name> --end=10")
```
Try acronym ↔ full name ("WHO" / "World Health Organization"), with/without legal suffix (Inc, Ltd, GmbH, S.p.A.). If found, go to **Enrich**.

## 2. Gather facts

Name, short neutral excerpt (what it is + why relevant), startDate / endDate (founded / dissolved, only if sourced), kind:
- `Public` — governments, public agencies, listed companies, parties, public institutions
- `Private` — private companies, foundations, private networks

If kind is genuinely unclear, ask the user.

## 3. Avatar

`liexp_cli("group find-avatar --name=<name>")` → media UUID. Continue without it on failure.

## 4. Create

`username` is a lowercase slug (`world-health-organization`).
```
liexp_cli("group create --name=<Name> --username=<slug> --kind=Public|Private --excerpt=<text> --avatar=<media-uuid> --startDate=YYYY-MM-DD")
```

## Enrich / members

1. `liexp_cli("group get --id=<uuid>")` — read current values and members.
2. Resolve each member with `actor list --fullName=...` (create through `actor-profile` if the user wants).
3. `liexp_cli("group edit --id=<uuid> --members=<actor-uuid,...>")` — the list **replaces** current members, so merge with the existing ones first.

## Report

Group UUID, fields set, members added, and unsourced facts left empty.
