---
name: story-write
description: Create or edit a story (long-form article) that references platform events, actors, groups and media
triggers: [story, article, write up, write-up, draft, narrative, post, blog, publish, long form]
agents: [auto, platform]
---

# Story Write

## 1. Existing story?

`liexp_cli("story list --query=<title words>")`. Editing → `story get --id=<uuid>` first and keep what the user didn't ask to change.

## 2. Gather the material

Events, actors and groups the story is about (use `timeline-build` for a chronology). Every factual statement in the body should trace to a platform event or a saved link.

## 3. Write

- Title: factual, not clickbait.
- Body: plain text paragraphs — intro (what and why it matters), chronology, open questions. Mention events by date and title; do not paste UUIDs into the prose.
- Neutral tone; attribute contested claims ("according to …").

## 4. Save

Create as draft unless the user says to publish:
```
liexp_cli("story create --title=<title> --path=<slug> --date=YYYY-MM-DD --draft=true --events=<uuid,...> --actors=<uuid,...> --groups=<uuid,...> --media=<uuid,...>")
liexp_cli("story edit --id=<uuid> --body=<plain text body>")
```
`path` is a lowercase URL slug of the title. Array flags on `story edit` replace the current lists — merge with existing values.

## 5. Report

Story UUID, path, draft status, and the events/actors it references.
