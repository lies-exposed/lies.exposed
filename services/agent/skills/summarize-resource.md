---
name: summarize-resource
description: Summarize a platform record (actor, group, event, link, story, media) or a web page into a short neutral excerpt, optionally saving it
triggers: [summarize, summary, summarise, excerpt, tldr, tl;dr, brief, short description, abstract, recap]
---

# Summarize Resource

## 1. Get the content

- Platform record → `liexp_cli("<resource> get --id=<uuid>")`; for links also `webScraping` the URL.
- URL only → `webScraping(<url>)`.

## 2. Write

- Default 1–3 sentences (≈60 words) unless the user asks for another length.
- Lead with the core fact: who / what / when.
- Neutral: attribute claims to their source, no adjectives that judge.
- Only facts present in the content. No speculation.
- Same language as the user's request.

## 3. Save (only if asked, platform agents only)

Use the record's excerpt field as plain text:
```
liexp_cli("actor edit --id=<uuid> --excerpt=<summary>")
liexp_cli("group edit --id=<uuid> --excerpt=<summary>")
liexp_cli("event <type> edit --id=<uuid> --excerpt=<summary>")
liexp_cli("link edit --id=<uuid> --description=<summary>")
```
Show the summary before saving if it replaces an existing non-empty excerpt.
