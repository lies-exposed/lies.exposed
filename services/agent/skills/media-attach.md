---
name: media-attach
description: Register an image, video, PDF or audio from a public URL as media, and attach it to events, links, areas or as actor/group avatar. Covers avatars/logos/photos, supported formats, and what to do when you only have a local file.
triggers: [media, image, photo, picture, video, pdf, audio, upload, attach, avatar, logo, thumbnail, file, profile picture, featured image]
agents: [auto, platform]
---

# Media Attach

## How "upload" works here

You **cannot upload bytes**. `createMedia` only registers a **publicly reachable URL**: the API checks the URL responds, saves the entry, and queues thumbnail generation. Nothing is copied to platform storage. So:

- Need a file from a URL → `createMedia({ "location": "<url>", "type": "<mime>" })`.
- User gives a local file / attachment / private URL → you cannot ingest it. Say so and ask for a public URL (or tell them to use the admin UI upload). Never invent a URL.
- Prefer stable direct file URLs (ending in `.jpg`/`.png`), not HTML pages. For an article page, scrape it (`webScraping`) and pick the `og:image` / main image URL.

## 1. Reuse if present

`findMedia({ "query": "<label words>" })` — reuse an existing media UUID for the same file/location.

## 2. Determine the MIME type (strict)

Allowed `type` values only: `image/jpeg`, `image/jpg`, `image/png`, `video/mp4`, `audio/mp3`, `audio/ogg`, `application/pdf`, `iframe/video`.

- **webp, gif, svg, avif are NOT supported.** For Wikipedia/Wikimedia SVG logos use the PNG rendition (`.../250px-Logo.svg.png`). Otherwise find another source image; do not label a webp as jpeg.
- Take the type from the URL extension; if ambiguous, fetch headers/page to confirm.
- Embedded platform videos (YouTube, Vimeo…) → `iframe/video` with the page URL. Direct `.mp4` → `video/mp4`.

## 3. Create

```
createMedia({ "location": "<public url>", "type": "<mime>", "label": "<short label>", "description": "<what it shows, source>", "events": ["<uuid>"], "links": ["<uuid>"], "areas": ["<uuid>"] })
```
Label: what it shows, not the filename. Description: what, when, who took/published it, source site. The result contains the media id.

If it errors with an accessibility/URL failure, the URL is not publicly fetchable (hotlink protection, login, 403) — try another source rather than retrying.

## 4. Avatars and logos

- Actor: `find_wikipedia_image({ "name": "<name>" })` → `{ imageUrl, type }`, then `createMedia` with `location=imageUrl` and that `type`, then `editActor({ "id": "<uuid>", "avatar": "<media-uuid>" })` (or pass `avatar` to `createActor`).
- Group: same lookup, then pass `avatar` to `createGroup`. `editGroup` has no avatar field, so an existing group's avatar cannot be changed.
- No Wikipedia page (or wrong image)? Find an official/portrait image URL via `searchWeb`/`webScraping` (official site, press kit, Wikimedia Commons), then `createMedia` with a label like `<Name> Avatar` and attach as above. Square, face/logo-centred images are best.
- Check before attaching: the image must clearly be that person/organisation (not a namesake). If unsure, tell the user instead of attaching.
- Existing avatar: `findActors({ "ids": [...] })` first; only overwrite if empty or clearly wrong, and say so.

## 5. Attach elsewhere

- Event: `editEvent({ "id": "<uuid>", "media": ["<existing...>", "<media-uuid>"] })` — list replaces, keep existing
- Area featured image: `editArea({ "id": "<uuid>", "featuredImage": "<media-uuid>" })`
- Story featured image: `editStory({ "id": "<uuid>", "featuredImage": "<media-uuid>" })`
- Book PDF / Documentary video: pass the media UUID to `pdf` / `documentaryMedia` (see `event-create`)

## 6. Report

Media UUID, type, source URL, and where it was attached.
