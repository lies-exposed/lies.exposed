---
name: event-enrich
description: Propose what should change on an existing event — read its own fields, scrape the sources already attached to it, diff every field, resolve names to identifiers, answer with a before → after list and the entities still absent; writes nothing
triggers: [enrich event, enrich, extract event relations, extract from an event, cross-check event, review what is wrong with an event, proposed changes, what should change]
agents: [auto, platform]
---

# Event Enrich

**Read-only.** No `create*` / `edit*` call in this workflow — not on the event, not on a participant, not on a keyword or link. You produce a proposal; a human applies it (via "process queue job" in the admin). Writing an existing record from a new source is a different task: use `event-update-from-source`.

## 1. Read the event

```
findEvents({ "ids": ["<uuid>"] })
```

Note `type`, `date`, `draft`, `excerpt`, `body`, `payload`, and the three relation lists (`links`, `media`, `keywords` — all UUID arrays). `excerpt`/`body` come back as rich-text documents: convert them with `blockNoteToText({ "blocknote": ... })` before comparing text, do not guess from the JSON.

The event's `type` decides which fields exist (see `event-create` for the table): `title` exists on Uncategorized/Transaction/Book/Patent/ScientificStudy/Documentary; `quote`/`details` only on Quote; `total`/`currency` only on Transaction; `endDate` and plain `actors`/`groups` only on Uncategorized.

## 2. Read the sources already attached to this event

```
findLinks({ "ids": ["<link id>", "..."] })     // url, title, publishDate
webScraping({ "url": "<url>" })                 // one call per link
```

Use only the links the event already has. If it has none, say so in `changes`-free prose and stop — do not search the web for a better source, do not add one. Quote each scraped fact with its URL for yourself; never put a URL inside a proposed value.

## 3. Diff field by field

Compare the sources against what is stored: date (and endDate), title where the type has one, excerpt, location, quote/details, total/currency, keywords.

- Empty in the record, stated in a source → propose it.
- Filled and contradicted → propose the new value only when the source is stronger (primary document, court record, official filing, first-hand statement). Otherwise keep the current value and report the conflict.
- `date` is when it happened, not when it was reported; if a source gives a tighter date or an end date, propose it.
- Never propose removing an existing participant, keyword, link or media because one source does not mention it. Relations are additive.
- A fact no source supports stays null: never invent values, amounts, dates or identifiers.

## 4. Resolve names to identifiers

Resolve every proposed relation to the UUID a lookup returned — never a name, never an invented or example UUID. One full-name lookup per entity; do not retry with partial names or surnames. `location` is an area UUID, `keywords` are keyword UUIDs.

```
findActors({ "fullName": "<full name>" })
findGroups({ "query": "<name>" })
findKeywords({ "q": "<term>" })
findAreas({ "query": "<place>" })      // location expects an area UUID
```

Several close matches → keep the one whose other details (dates, nationality, memberships) agree; if you cannot tell them apart, report it as ambiguous. Not found → put the name in `missing`, never put a UUID there and never load `actor-profile` / `group-profile`. Existing identifiers stay in the list; you only add.

## 5. Answer

The final message is the output: write out every proposed value and every UUID in full, because nothing else survives this run. No tool call, no "see above", no abbreviations.

```
title: <proposed title or null>
date: <YYYY-MM-DD or null>
excerpt: <1-3 factual sentences of plain text, no URLs, or null>
location: <area UUID or null>
endDate: <YYYY-MM-DD or null>
quote / details: <Quote only — text or null>
total / currency: <Transaction only — number and code, else null>
actors: [<UUIDs to add>]      groups: [<UUIDs to add>]
keywords: [<UUIDs to add>]
missing: { actors: [names], groups: [names], keywords: [names] }
changes: [ { field: date, before: 2019-05-01, after: 2019-04-30 }, ... ]
```

A value you did not extract is `null` — that means "leave it alone", not "clear it". An empty list means nothing to add. `changes` lists only the fields you propose to change, each with its current value and the new one (empty list when the record already matches the sources); conflicts you decided not to apply are listed in prose after the block, with the stronger source named.
