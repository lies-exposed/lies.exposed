---
name: link-ingest
description: URL or link record → scrape it, extract actors/groups/events, dedupe against the database, save the link and connect entities
triggers: [url, link, article, http, https, source, scrape, ingest, save link, add link]
agents: [auto, platform]
---

# Link Ingest

Use when the user shares a URL, references a link record (`links with ID <uuid>`), or says "this article / this link".

## 1. Identify the link

- Raw URL → go to step 2.
- Link UUID → `liexp_cli("link get --id=<uuid>")` to read its URL and metadata.
- "the link I just shared" → use the context block or the previous message; never ask the user to paste the content.

## 2. Check the link already exists

`liexp_cli("link list --query=<domain or title words>")`. If the URL is already stored, reuse its UUID — do not create it again.

## 3. Scrape the content

`webScraping(<url>)` for the full page. Do not rely on search snippets.
If scraping fails (paywall, block), `searchWeb` the title or a key phrase to find a mirror or syndicated copy.

## 4. Extract entities

Only what the text explicitly states:
- **People** — full name plus aliases/titles
- **Organizations** — companies, agencies, parties, NGOs, institutions
- **Events** — what happened, when (exact date if stated), who was involved
- **Key claims** — the assertions the article makes, with the quoted wording when possible

## 5. Resolve against the database

For each entity try several spellings (full name, surname only, acronym, native spelling):
```
liexp_cli("actor list --fullName=<name> --end=10")
liexp_cli("group list --query=<name> --end=10")
liexp_cli("event list --query=<keywords> --end=10")
```
Record the UUID of every match.

## 6. Create what is missing

- Missing actors → follow the `actor-profile` skill (avatar via `actor find-avatar`).
- Missing groups → follow the `group-profile` skill.
- A clear, dated event described by the article → follow the `event-create` skill and pass the link UUID in `--links`.

## 7. Save and connect the link

```
liexp_cli("link create --url=<url>")                         # only if step 2 found nothing
liexp_cli("link edit --id=<link-uuid> --events=<event-uuid,...>")
```
`--events` replaces the list: include the link's existing event UUIDs too.

## 8. Report

One short summary: link UUID, entities matched (with UUIDs), entities created, events created/linked, and anything skipped with the reason.

If the user asks whether the article's claims are true, switch to the `fact-check-claim` skill after ingesting.
