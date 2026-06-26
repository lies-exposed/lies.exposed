---
name: link_handling
description: Workflow for handling URLs and link content — scrape, extract entities, query database, create or link
---

# Link & Content Handling

When the user provides a URL or references a link, follow this workflow:

## 1. Identify the Link

The user may provide:
- A raw URL: `https://example.com/article`
- A link ID: `link with ID xxx`
- A reference: `the link I just shared`, `that article`

If you have a URL, proceed to step 2. If you have a link ID, fetch it with `liexp_cli("link get --id=<uuid>")` first to confirm it exists and get its metadata.

## 2. Scrape the Content

Use `webScraping` to fetch and read the full article content. Do not rely on search snippets — scrape the actual page.

If scraping fails (blocked, paywalled, etc.), fall back to `searchWeb` with the article title or key phrases to find the content or a cached version.

## 3. Extract Entities

From the scraped content, identify:
- **Primary person(s)** — the main subject(s) mentioned (full name, any aliases)
- **Organization(s)** — companies, agencies, groups, institutions
- **Event(s)** — specific incidents, dates, locations
- **Key claims or facts** — what the article asserts

Do not guess or invent names. Extract only what is explicitly stated in the content.

## 4. Check the Database

Search the platform database for each extracted entity:
```
liexp_cli("actor list --query=<name>")
liexp_cli("group list --query=<name>")
liexp_cli("event list --query=<event description>")
```

Try variations: full name, last name only, abbreviations, related terms.

## 5. Create or Link

- **If entities exist** — note their IDs and proceed to link them to the user's link.
- **If entities do NOT exist** — create them. For actors, try `actor find-avatar` first to grab an avatar image.

## 6. Link Creation

Create the link if it doesn't already exist in the database:
```
liexp_cli("link create --url=<url>")
```

Then associate extracted entities with the link by editing the link or creating events that reference it.

## When to Delegate to Researcher

Transfer to the Researcher when:
- The link content raises claims that need cross-source verification
- The extracted entities need biographical or historical context
- You need to verify whether the article's claims are accurate or disputed

Do NOT delegate for:
- Simple entity extraction and database creation
- Quick lookups of extracted names/organizations
- Creating links and associating them with entities
