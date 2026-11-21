---
name: event-create
description: Create an event of the right type (Uncategorized, Death, Quote, Transaction, ScientificStudy, Book, Patent, Documentary) with its required fields, actors, groups, links and media
triggers: [event, happened, incident, died, death, killed, quote, said, statement, transaction, paid, payment, funded, donation, grant, study, paper, research, book, patent, documentary, film]
agents: [auto, platform]
---

# Event Create

## 1. Dedupe

`findEvents({ "query": "<keywords>", "startDate": "<date-7d>", "endDate": "<date+7d>", "end": 10 })`, also filtered by `"actors": ["<uuid>"]` / `"groups": ["<uuid>"]` when known. If the same event exists, edit it instead (see `event-update-from-source`).

## 2. Pick the type

| The event is… | `type` for `createEvent` |
|---|---|
| A person's death | Death |
| Something someone said/wrote, quoted verbatim | Quote |
| Money moving between actors/groups (payment, donation, grant, contract, investment) | Transaction |
| A published scientific paper / study | ScientificStudy |
| A book | Book |
| A patent filing/grant | Patent |
| A documentary film | Documentary |
| Anything else (decision, law, meeting, scandal, incident) | Uncategorized |

## 3. Fields per type

`createEvent` takes `type` plus: `date` (YYYY-MM-DD — when it happened, not when it was reported), `excerpt`, `body`, `draft`, `links`, `media`, `keywords` (UUID arrays), and the type-specific fields below. There are no per-type actor/group fields (victim, quote author, from/to, location): put actors and groups in the excerpt text and link the source via `links`; say so to the user.

| Type | Type-specific fields |
|---|---|
| Uncategorized | — |
| Death | — |
| Quote | — |
| Transaction | `amount`, `currency`, `source` |
| ScientificStudy | `title`, `description`, `summary`, `image` (media UUID) |
| Book | `publisher`, `authors` (names), `pdf`, `audio` |
| Patent | `title`, `description`, `summary`, `image`, `publicationDate`, `patentNumber`, `applicant`, `ownerActors`, `ownerGroups` |
| Documentary | `title`, `description`, `summary`, `image`, `documentaryMedia`, `website`, `authorActors`, `authorGroups`, `subjectActors`, `subjectGroups` |

Fields that are UUIDs must be resolved first:
- actors → `findActors({ "fullName": "..." })` (create via `actor-profile`)
- groups → `findGroups({ "query": "..." })` (create via `group-profile`)
- links → `createLink({ "url": "..." })` (or reuse from `findLinks`)
- media → `createMedia({ "location": "<url>", "type": "<mime>" })` (see `media-attach`)

If a value you need (amount, currency, date, who paid whom) is unknown, **ask the user** — never guess.

## 4. Create

```
createEvent({ "type": "Transaction", "date": "2021-04-02", "amount": "1500000", "currency": "USD", "links": ["<link-uuid>"], "excerpt": "<who paid whom, what for>" })
```
Write the excerpt as 1–3 factual sentences, citing who reported it when the claim is disputed. Create with `"draft": true` when the facts come from a single unverified source.

## 5. Report

Event UUID, type, date, linked actors/groups/links, and anything left out.
