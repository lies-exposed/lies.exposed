---
name: timeline-build
description: Build a chronological timeline for a topic, actor, group or story from platform events — find gaps and contradictions, optionally fill them from the web
triggers: [timeline, chronology, chronological, history of, sequence, what happened, when did, series of events, over time]
agents: [auto, platform]
---

# Timeline Build

## 1. Collect events

Combine filters to cover the topic:
```
liexp_cli("event list --query=<topic keywords> --end=100")
liexp_cli("event list --actors=<uuid> --end=100")
liexp_cli("event list --groups=<uuid> --startDate=YYYY-MM-DD --endDate=YYYY-MM-DD --end=100")
```
Try 2–3 keyword variants. De-duplicate by event UUID. For a story, start from `story get --id=<uuid>` and its linked events.

## 2. Order and check

Sort by date. Flag:
- **Gaps** — long silent periods or missing obvious steps (e.g. a contract without the tender before it)
- **Contradictions** — events that disagree on date, amount or actors
- **Near-duplicates** — two events describing the same thing

## 3. Fill gaps (only if the user asks)

`searchWeb` for the missing step; add confirmed ones through `event-create` with source links.

## 4. Output

```
YYYY-MM-DD — <title> (<type>) — actors/groups — [event UUID]
```
Then gaps, contradictions and duplicates as separate short lists. Offer to turn the timeline into a story (`story-write`).
