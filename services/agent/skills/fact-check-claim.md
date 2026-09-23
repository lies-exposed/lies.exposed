---
name: fact-check-claim
description: Verify a claim — check platform data first, then search the claim and its counter-claim on the web, weigh sources by the source hierarchy, return a verdict with citations
triggers: [fact check, factcheck, verify, true, false, claim, is it true, debunk, misleading, evidence, prove, disputed, accurate]
---

# Fact-Check a Claim

## 1. Pin down the claim

Restate it as one checkable sentence: who, did what, when, how much. If it is vague or an opinion, say which part is checkable and check that part.

## 2. Platform first (if you have `liexp_cli`)

```
liexp_cli("event list --query=<keywords> --end=20")
liexp_cli("actor list --fullName=<name>")  /  liexp_cli("group list --query=<name>")
```
Curated platform events are the baseline. Researcher agents without the CLI: skip this step and say platform data was not checked.

## 3. Search both directions

- 2–3 phrasings of the claim **and** 2–3 phrasings of its negation / counter-narrative.
- Look for the **primary source**: the document, filing, study, court record, video, or full original statement.
- `webScraping` the key pages — never judge from snippets.
- Check dates: a claim can be true then and false now (or the reverse).

## 4. Weigh the sources

Primary sources > independent investigative work > everything else. Treat press releases, government statements, corporate/NGO communications and fact-checking organisations as interested parties: use their facts, question their framing, note who funds them when relevant.

## 5. Verdict

One of: **Supported**, **Partly supported**, **Unsupported**, **Contradicted**, **Unverifiable**. Then:
- 2–5 bullets of evidence, each with its source URL
- what is missing or disputed, and who disputes it
- the platform events/actors involved (UUIDs) if any

## 6. Store (only if asked, platform agents only)

Save sources with `link create`, and if the claim is a dated fact worth recording use `event-create` (Quote for statements, Uncategorized otherwise), as draft unless primary-sourced.
