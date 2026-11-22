---
name: group-profile
description: Create a new group (organization, company, party, agency, NGO) or enrich an existing one — dedupe, avatar, kind, dates, members
triggers: [group, organization, organisation, company, corporation, party, agency, ngo, foundation, institution, members, founded]
agents: [auto, platform]
---

# Group Profile

## 1. Dedupe first — always

```
findGroups({ "query": "<name>", "end": 10 })
findGroups({ "query": "<acronym or short name>", "end": 10 })
```
Try acronym ↔ full name ("WHO" / "World Health Organization"), with/without legal suffix (Inc, Ltd, GmbH, S.p.A.). If found, go to **Enrich**.

## 2. Gather facts

Name, short neutral excerpt (what it is + why relevant), startDate / endDate (founded / dissolved, only if sourced), kind:
- `Public` — governments, public agencies, listed companies, parties, public institutions
- `Private` — private companies, foundations, private networks

If kind is genuinely unclear, ask the user.

## 3. Avatar

`find_wikipedia_image({ "name": "<name>" })` → `{ imageUrl, type }`, then `createMedia({ "location": "<imageUrl>", "type": "<type>", "label": "<name>" })`; the returned media id is the avatar. Continue without it on failure.

## 4. Create

`username` is a lowercase slug (`world-health-organization`).
```
createGroup({ "name": "<Name>", "username": "<slug>", "color": "<hex without #>", "kind": "Public" | "Private", "avatar": "<media-uuid>", "startDate": "YYYY-MM-DD" })
```
`color` is required (hex without `#`). `excerpt`/`body` accept plain text (converted to a rich-text document) or a BlockNote document. The avatar (media UUID) can be set at creation or later with `editGroup`.
```
```

## Enrich / members

1. `findGroups({ "ids": ["<uuid>"] })` — read current values and members.
2. Resolve each member with `findActors({ "fullName": "..." })` (create through `actor-profile` if the user wants).
3. `createGroupMember({ "group": "<group-uuid>", "actor": "<actor-uuid>", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "body": "<role>" })` — one call per member (`endDate`/`body` optional). Do **not** pass actor or group UUIDs to `editGroup.members` / `editActor.memberIn`: strings there are existing group-member row ids.

## Report

Group UUID, fields set, members added, and unsourced facts left empty.
