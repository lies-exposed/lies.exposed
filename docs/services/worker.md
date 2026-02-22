# Worker Service

**Location:** `services/worker`
**Version:** 0.1.10

## Purpose

The Worker service handles background automation:
- Runs scheduled cron jobs
- Listens to Redis pub/sub for event-driven tasks
- Enriches entities from Wikipedia
- Manages social media posting (Telegram, Instagram)
- Processes media (thumbnails, transfers)
- Runs NLP entity extraction
- Generates platform statistics

## Architecture

**Entry Point:** `services/worker/src/run.ts`

The service initializes:
1. WorkerContext with all providers
2. Redis subscribers for event handling
3. Cron jobs for scheduled tasks
4. Telegram bot for command handling

### Directory Structure

```
services/worker/
├── src/
│   ├── context/       # WorkerContext definition
│   ├── jobs/          # Cron job orchestration
│   ├── services/
│   │   └── subscribers/  # Redis subscriber setup
│   ├── flows/         # Business logic flows
│   ├── providers/
│   │   └── tg/        # Telegram bot commands
│   └── bin/           # CLI utilities
├── test/
└── build/
```

### WorkerContext

```typescript
type WorkerContext = ENVContext &
  LoggerContext &
  DatabaseContext &
  ConfigContext &
  FSClientContext &
  RedisContext &
  SpaceContext &
  PDFProviderContext &
  HTTPProviderContext &
  PuppeteerProviderContext &
  NERProviderContext &
  ImgProcClientContext &
  FFMPEGProviderContext &
  TGBotProviderContext &
  IGProviderContext &
  QueuesProviderContext &
  GeocodeProviderContext &
  BlockNoteContext &
  URLMetadataContext &
  WikipediaProviderContext & {
    rw: WikipediaProvider;
  };
```

## Cron Jobs

| Job | Schedule Env Var | Description |
|-----|------------------|-------------|
| Social Posting | `SOCIAL_POSTING_CRON` | Post scheduled content to social platforms |
| Temp Folder Cleanup | `TEMP_FOLDER_CLEAN_UP_CRON` | Clean temporary files |
| Process Done Jobs | `PROCESS_DONE_JOB_CRON` | Handle completed AI queue jobs |
| Regenerate Thumbnails | `REGENERATE_MEDIA_THUMBNAILS_CRON` | Regenerate missing thumbnails |

## Redis Pub/Sub Subscribers

### Registered subscribers

All subscribers are registered in `services/worker/src/services/subscribers/WorkerSubscribers.ts`.

| Subscriber | Channel | Purpose |
|------------|---------|---------|
| `SearchLinksSubscriber` | `link:search` | Search for links |
| `TakeLinkScreenshotSubscriber` | `link:take-screenshot` | Capture link screenshots |
| `UpdateEntitiesFromURLSubscriber` | `link:update-entities-from-url` | Process completed AI entity-update job |
| `GenerateThumbnailSubscriber` | *(media)* | Generate media thumbnails |
| `CreateMediaThumbnailSubscriber` | *(media)* | Create specific thumbnails |
| `ExtractMediaExtraSubscriber` | *(media)* | Extract media metadata |
| `TransferFromExternalProviderSubscriber` | *(media)* | Transfer media from external URLs |
| `CreateEventFromURLSubscriber` | *(event)* | Create events from URLs |
| `PostToSocialPlatformsSubscriber` | *(social)* | Post to social media |
| `ExtractEntitiesWithNLPSubscriber` | *(nlp)* | NLP entity extraction |
| `SearchFromWikipediaSubscriber` | *(wikipedia)* | Wikipedia search and creation |
| `CreateEntityStatsSubscriber` | *(stats)* | Generate entity statistics |
| `ProcessJobDoneSubscriber` | `job:process-done` | Handle completed queue jobs |

### How it works

The `Subscriber` factory (from `@liexp/backend`) wraps a `RedisPubSub` channel and a handler:

```typescript
// services/worker/src/services/subscribers/link/updateEntitiesFromURL.subscriber.ts
export const UpdateEntitiesFromURLSubscriber = Subscriber(
  LinkPubSub.UpdateEntitiesFromURL,        // typed channel
  (payload): RTE<void> =>
    pipe(
      GetQueueProvider.queue(payload.type).getJob(payload.resource, payload.id),
      fp.RTE.chain(processDoneJob),
      fp.RTE.map(() => undefined),
    ),
);
```

`WorkerSubscribers` subscribes all channels at startup and dispatches incoming messages:

```typescript
// services/worker/src/services/subscribers/WorkerSubscribers.ts
ctx.redis.client.on("message", (channel, message) => {
  handlers.filter((h) => h.channel === channel)
    .forEach((sub) => sub.handler(message));
});
```

### Adding a subscriber

1. Create the pub/sub channel in `@liexp/backend` (see [backend docs](../packages/backend.md#redis-pubsub)).
2. Create `services/worker/src/services/subscribers/<resource>/<name>.subscriber.ts`:

```typescript
import { Subscriber } from "@liexp/backend/lib/providers/redis/Subscriber.js";
import { LinkPubSub } from "@liexp/backend/lib/pubsub/links/index.js";

export const MySubscriber = Subscriber(
  LinkPubSub.MyChannel,
  (payload): RTE<void> => pipe(/* handler logic */),
);
```

3. Register it in `WorkerSubscribers.ts` under the appropriate section comment.

### Queue job completion pattern

For subscribers that process completed AI queue jobs (the `UpdateEntitiesFromURL` pattern):

```
API                           Worker
 │                               │
 ├─ addJob(queue DB) ────────────┤
 ├─ publish(Redis channel) ──────►
 │                               ├─ getJob(queue DB)
 │                               ├─ processDoneJob()
 │                               └─ updateJob("completed")
```

The subscriber fetches the job from the DB (not from Redis — only the job ID travels over Redis), processes it via `processDoneJob`, and marks it completed.

## Wikipedia Integration

```typescript
// Fetch and create actor from Wikipedia
fetchAndCreateActorFromWikipedia(title: string, wp: WikiProviders)

// Search and create actor from Wikipedia
searchActorAndCreateFromWikipedia(search: string, wp: WikiProviders)

// Similar flows for areas and groups
fetchAndCreateAreaFromWikipedia(title: string, wp: WikiProviders)
fetchGroupFromWikipedia(title: string, wp: WikiProviders)
```

## Social Media Posting

The worker supports posting to:
- **Telegram**: Via `node-telegram-bot-api`
- **Instagram**: Via `instagram-private-api`

```typescript
postToSocialPlatforms({
  id: UUID,
  platforms: { IG: boolean, TG: boolean }
})
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `WEB_URL` | Frontend URL |
| `DB_*` | Database configuration |
| `SPACE_*` | S3 storage configuration |
| `REDIS_HOST`, `REDIS_CONNECT` | Redis configuration |
| `TG_BOT_TOKEN`, `TG_BOT_CHAT`, `TG_BOT_USERNAME` | Telegram bot |
| `TG_BOT_POLLING`, `TG_BOT_BASE_API_URL` | Telegram settings |
| `IG_USERNAME`, `IG_PASSWORD` | Instagram credentials |
| `GEO_CODE_BASE_URL`, `GEO_CODE_API_KEY` | Geocoding |
| `TEMP_FOLDER_CLEAN_UP_CRON` | Cleanup schedule |
| `SOCIAL_POSTING_CRON` | Social posting schedule |
| `PROCESS_DONE_JOB_CRON` | Job processing schedule |
| `REGENERATE_MEDIA_THUMBNAILS_CRON` | Thumbnail schedule |

## CLI Commands

```bash
# From services/worker directory
pnpm bin:run <command>
pnpm bin:generate-thumbnails
pnpm bin:upsert-nlp-entities

# Available CLI commands (in /src/bin/)
# - assign-default-area-featured-image
# - clean-space-media
# - clean-tg-messages
# - create-from-wikipedia
# - create-stats
# - extract-entities-from-url
# - extract-events
# - generate-missing-thumbnails
# - import-from-kmz
# - parse-tg-message
# - set-default-group-usernames
# - share-post-message
# - update-event-payload-url-refs
# - upsert-nlp-entities
# - upsert-tg-pinned-message
```

## Development Commands

```bash
# From repo root
pnpm --filter worker dev        # Start development with watch
pnpm --filter worker build      # Compile TypeScript
pnpm --filter worker test       # Run tests
pnpm --filter worker test:e2e   # Run e2e tests

# From services/worker directory
pnpm dev
pnpm build
```
