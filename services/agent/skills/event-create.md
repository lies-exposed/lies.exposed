---
name: event-create
description: Create an event of the right type (Uncategorized, Death, Quote, Transaction, ScientificStudy, Book, Patent, Documentary) with its required fields, actors, groups, links and media
triggers: [event, happened, incident, died, death, killed, quote, said, statement, transaction, paid, payment, funded, donation, grant, study, paper, research, book, patent, documentary, film]
agents: [auto, platform]
---

# Event Create

## 1. Dedupe

`liexp_cli("event list --query=<keywords> --startDate=<date-7d> --endDate=<date+7d> --end=10")`, also filtered by `--actors=<uuid>` / `--groups=<uuid>` when known. If the same event exists, edit it instead (see `event-update-from-source`).

## 2. Pick the type

| The event is… | Type | Command |
|---|---|---|
| A person's death | Death | `event death create` |
| Something someone said/wrote, quoted verbatim | Quote | `event quote create` |
| Money moving between actors/groups (payment, donation, grant, contract, investment) | Transaction | `event transaction create` |
| A published scientific paper / study | ScientificStudy | `event scientific-study create` |
| A book | Book | `event book create` |
| A patent filing/grant | Patent | `event patent create` |
| A documentary film | Documentary | `event documentary create` |
| Anything else (decision, law, meeting, scandal, incident) | Uncategorized | `event uncategorized create` |

## 3. Required fields per type

All types: `--date=YYYY-MM-DD` (when it happened, not when it was reported). Common optional: `--excerpt=<plain text>`, `--links=<link-uuid,...>`, `--media=<media-uuid,...>`, `--draft=true|false`.

| Type | Required | Useful optional |
|---|---|---|
| Uncategorized | `--title` | `--actors`, `--groups`, `--location=<area-uuid>`, `--endDate` |
| Death | `--victim=<actor-uuid>` | `--location=<area-uuid>` |
| Quote | `--actor=<actor-uuid>`, `--quote=<text>` | `--details` |
| Transaction | `--title`, `--total`, `--currency`, `--fromType=Actor\|Group`, `--fromId`, `--toType=Actor\|Group`, `--toId` | — |
| ScientificStudy | `--title`, `--studyUrl=<link-uuid>` | `--authors`, `--publisher=<actor-uuid>`, `--image=<media-uuid>` |
| Book | `--title`, `--pdf=<media-uuid>` | `--authors`, `--publisher`, `--audio` |
| Patent | `--title` | `--ownerActors`, `--ownerGroups`, `--source=<link-uuid>` |
| Documentary | `--title`, `--documentaryMedia=<media-uuid>` | `--website=<link-uuid>`, `--authorActors/--authorGroups`, `--subjectActors/--subjectGroups` |

Fields that are UUIDs must be resolved first:
- actors → `actor list --fullName=...` (create via `actor-profile`)
- groups → `group list --query=...` (create via `group-profile`)
- links → `link create --url=...` (or reuse from `link list`)
- media → `media create --location=<url> --type=<mime>` (see `media-attach`)
- location → `area list --query=...`

If a **required** value is unknown (amount, currency, date, who paid whom), **ask the user** — never guess.

## 4. Create

```
liexp_cli("event transaction create --date=2021-04-02 --title=<title> --total=1500000 --currency=USD --fromType=Group --fromId=<uuid> --toType=Actor --toId=<uuid> --links=<link-uuid> --excerpt=<text>")
```
Write the excerpt as 1–3 factual sentences, citing who reported it when the claim is disputed. Create as `--draft=true` when the facts come from a single unverified source.

## 5. Report

Event UUID, type, date, linked actors/groups/links, and anything left out.
