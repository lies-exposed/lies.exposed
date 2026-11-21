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

`createEvent` takes `type` plus: `date` (YYYY-MM-DD — when it happened, not when it was reported; required), `excerpt`, `body` (plain text is converted to a rich-text document), `draft`, `links`, `media`, `keywords` (UUID arrays), and the type-specific fields below. A missing required field returns an error naming it — ask the user for it.

`subject`/`from`/`to`/`publisher` are `{ "type": "Actor" | "Group", "id": "<uuid>" }`; `authors` (Book) is an array of those.

| Type | Type-specific fields (required in **bold**) |
|---|---|
| Uncategorized | **`title`**, `actors`, `groups`, `groupsMembers` (UUID arrays), `location` (area UUID), `endDate` |
| Death | **`victim`** (actor UUID), `location` (area UUID) |
| Quote | `actor` (actor UUID), `quote` (text), `details`, `subject` |
| Transaction | **`title`**, **`total`** (number), **`currency`**, **`from`**, **`to`** |
| ScientificStudy | **`title`**, **`url`** (link UUID), `image` (media UUID), `studyAuthors` (actor UUIDs), `studyPublisher` (group UUID) |
| Book | **`title`**, **`pdf`** (media UUID), `audio`, `authors`, `publisher` |
| Patent | **`title`**, **`source`** (link UUID), `ownerActors`, `ownerGroups` |
| Documentary | **`title`**, **`documentaryMedia`** (single media UUID), `website` (link UUID), `authorActors`, `authorGroups`, `subjectActors`, `subjectGroups` |

`editEvent` accepts the same fields (only the ones you pass change; nested ones like `pdf`/`audio` are merged with the stored values), so an event can be pointed at an area with `location`.

Fields that are UUIDs must be resolved first:
- actors → `findActors({ "fullName": "..." })` (create via `actor-profile`)
- groups → `findGroups({ "query": "..." })` (create via `group-profile`)
- links → `createLink({ "url": "..." })` (or reuse from `findLinks`)
- media → `createMedia({ "location": "<url>", "type": "<mime>" })` (see `media-attach`)

If a value you need (amount, currency, date, who paid whom) is unknown, **ask the user** — never guess.

## 4. Create

```
createEvent({ "type": "Transaction", "date": "2021-04-02", "title": "<short title>", "total": 1500000, "currency": "USD", "from": { "type": "Group", "id": "<payer-uuid>" }, "to": { "type": "Actor", "id": "<payee-uuid>" }, "links": ["<link-uuid>"], "excerpt": "<who paid whom, what for>" })
```
Write the excerpt as 1–3 factual sentences, citing who reported it when the claim is disputed. Create with `"draft": true` when the facts come from a single unverified source.

## 5. Report

Event UUID, type, date, linked actors/groups/links, and anything left out.
