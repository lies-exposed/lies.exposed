---
name: media-attach
description: Save an image, video, PDF or audio from a URL as media and attach it to events, links, areas or as actor/group avatar
triggers: [media, image, photo, picture, video, pdf, audio, upload, attach, avatar, logo, thumbnail, file]
agents: [auto, platform]
---

# Media Attach

## 1. Reuse if present

`liexp_cli("media list --query=<label words>")` — reuse an existing media UUID for the same file.

## 2. Determine the MIME type

From the URL extension or the page: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`, `application/pdf`, `audio/mpeg`. For YouTube/other platform videos pass the page URL with `video/mp4` only if the user confirms the platform is supported; otherwise ask.

## 3. Create

```
liexp_cli("media create --location=<file url> --type=<mime> --label=<short label> --description=<what it shows, source> --events=<uuid,...> --links=<uuid,...> --areas=<uuid,...>")
```
Label: what it shows, not the filename. Description: what, when, who took/published it.

## 4. Attach elsewhere

- Actor avatar: `actor edit --id=<uuid> --avatar=<media-uuid>` (or `actor find-avatar --fullName=...` for Wikipedia)
- Group avatar: `group edit --id=<uuid> --avatar=<media-uuid>` (or `group find-avatar --name=...`)
- Event: `event <type> edit --id=<uuid> --media=<existing...>,<media-uuid>` — list replaces, keep existing
- Area featured image: `area edit --id=<uuid> --featuredImage=<media-uuid>`
- Book PDF / Documentary video: pass the media UUID to `--pdf` / `--documentaryMedia` (see `event-create`)

## 5. Report

Media UUID, type, and where it was attached.
