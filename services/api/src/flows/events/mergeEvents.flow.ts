import { type DatabaseContext } from "@liexp/backend/lib/context/db.context.js";
import { type ENVContext } from "@liexp/backend/lib/context/env.context.js";
import { type LoggerContext } from "@liexp/backend/lib/context/logger.context.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import {
  toBadRequestError,
  toNotFoundError,
} from "@liexp/backend/lib/errors/index.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { EventRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  MergeEventsHelper,
  getUniqueIds,
} from "@liexp/shared/lib/helpers/event/merge-event.helper.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { In } from "typeorm";
import { toControllerError } from "../../io/ControllerError.js";
import { type ENV } from "../../io/ENV.js";
import { fetchEventsRelations } from "./fetchEventsRelations.flow.js";
import { type TEReader } from "#flows/flow.types.js";

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------

/** Result of sorting events by provided ID order */
interface SortedEventsResult {
  target: EventV2Entity;
  sources: EventV2Entity[];
  sourceIds: UUID[];
}

/** Event data with relations in entity reference format */
interface MergedEventData extends Omit<
  Event,
  "links" | "media" | "keywords" | "socialPosts"
> {
  links: { id: UUID }[];
  media: { id: UUID }[];
  keywords: { id: UUID }[];
  socialPosts: { id: UUID }[];
}

/** Context constraint for merge operations */
type MergeContext = DatabaseContext & LoggerContext & ENVContext<ENV>;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Deduplicates an array of UUIDs while preserving order.
 */
const deduplicateIds = (ids: readonly UUID[]): UUID[] => [...new Set(ids)];

/**
 * Loads events with their relation IDs (not full entities).
 */
const loadEventsWithRelationIds = <C extends MergeContext>(
  ids: readonly UUID[],
): TEReader<EventV2Entity[], C> =>
  EventRepository.find<C>({
    where: { id: In(ids) },
    loadRelationIds: {
      relations: ["links", "media", "keywords"],
    },
  });

/**
 * Sorts events by the provided ID order and separates target from sources.
 * The first event becomes the target, remaining become sources.
 */
const sortEventsByIdOrder = <C extends MergeContext>(
  ids: readonly UUID[],
  events: EventV2Entity[],
): TEReader<SortedEventsResult, C> => {
  if (events.length < 2) {
    return fp.RTE.left(
      toNotFoundError(`Expected at least 2 events, found ${events.length}`),
    );
  }

  const sortedEvents = ids
    .map((id) => events.find((e) => e.id === id))
    .filter((e): e is EventV2Entity => e !== undefined);

  if (sortedEvents.length < 2) {
    return fp.RTE.left(toNotFoundError("Could not find all events to merge"));
  }

  const [target, ...sources] = sortedEvents;
  const sourceIds = sources.map((s) => s.id);

  return fp.RTE.right({ target, sources, sourceIds });
};

/**
 * Converts event relation UUIDs to entity reference format { id: UUID }.
 */
const toEntityRelationFormat = (event: Event): MergedEventData => ({
  ...event,
  links: event.links.map((id) => ({ id })),
  media: event.media.map((id) => ({ id })),
  keywords: event.keywords.map((id) => ({ id })),
  socialPosts: (event.socialPosts ?? []).map((id) => ({ id })),
});

/**
 * Decodes events, fetches relations, and builds the merged event data.
 */
const buildMergedEventData = <C extends MergeContext>(
  allEvents: EventV2Entity[],
  targetType: EventType,
): TEReader<MergedEventData, C> =>
  pipe(
    fp.RTE.Do,
    fp.RTE.bind("decoded", () =>
      pipe(EventV2IO.decodeMany(allEvents), fp.RTE.fromEither),
    ),
    fp.RTE.bind("relations", ({ decoded }) =>
      fetchEventsRelations<C>(decoded, true),
    ),
    fp.RTE.map(({ decoded, relations }) =>
      MergeEventsHelper.mergeEvents(decoded, targetType, relations),
    ),
    fp.RTE.map(toEntityRelationFormat),
    fp.RTE.mapLeft(toControllerError),
  );

/** Story entity with events as ID references for TypeORM relation updates */
type StoryWithEventIds = Omit<StoryEntity, "events"> & {
  events: { id: UUID }[];
};

/**
 * Replaces source event references with target event reference in a story.
 * Ensures no duplicate target references.
 */
const replaceSourceEventsWithTarget = (
  story: StoryEntity,
  targetId: UUID,
  sourceIds: UUID[],
): StoryWithEventIds => {
  const eventIds = getUniqueIds(story.events);
  const filteredIds = eventIds.filter((id) => !sourceIds.includes(id));

  if (!filteredIds.includes(targetId)) {
    filteredIds.push(targetId);
  }

  return {
    ...story,
    events: filteredIds.map((id) => ({ id })),
  };
};

/**
 * Executes the merge operation within a database transaction.
 * Saves merged event, updates story references, and soft-deletes sources.
 */
const executeMergeTransaction = <C extends MergeContext>(
  target: EventV2Entity,
  sourceIds: UUID[],
  mergedEventData: MergedEventData,
  allEventIds: UUID[],
): TEReader<Event, C> =>
  pipe(
    fp.RTE.ask<C>(),
    fp.RTE.chainTaskEitherK((ctx) =>
      ctx.db.transaction((txCtx) =>
        pipe(
          // 1. Save the merged event
          pipe(
            fp.TE.Do,
            fp.TE.tap(() => {
              ctx.logger.info.log("Saving merged event %s", target.id);
              return fp.TE.right(undefined);
            }),
            fp.TE.chainFirst(() =>
              txCtx.save(EventV2Entity, [mergedEventData]),
            ),
          ),
          // 2. Update stories that reference source events
          fp.TE.chainFirst(() =>
            pipe(
              txCtx.find(StoryEntity, {
                where: { events: { id: In(allEventIds) } },
                relations: ["events"],
              }),
              fp.TE.chain((stories) => {
                if (stories.length === 0) {
                  ctx.logger.debug.log("No stories to update");
                  return fp.TE.right(undefined);
                }

                ctx.logger.info.log(
                  "Updating %d stories to reference merged event",
                  stories.length,
                );

                const updatedStories = stories.map((story) =>
                  replaceSourceEventsWithTarget(story, target.id, sourceIds),
                );

                return pipe(
                  txCtx.save(StoryEntity, updatedStories),
                  fp.TE.map(() => undefined),
                );
              }),
            ),
          ),
          // 3. Soft-delete source events
          fp.TE.chainFirst(() => {
            ctx.logger.info.log("Soft-deleting source events: %O", sourceIds);
            return txCtx.softDelete(EventV2Entity, sourceIds);
          }),
          // 4. Reload and return the merged event
          fp.TE.chain(() =>
            txCtx.findOneOrFail(EventV2Entity, {
              where: { id: target.id },
              loadRelationIds: {
                relations: ["media", "links", "keywords"],
              },
            }),
          ),
          fp.TE.chainEitherK(EventV2IO.decodeSingle),
        ),
      ),
    ),
  );

// -----------------------------------------------------------------------------
// Main Flow
// -----------------------------------------------------------------------------

/**
 * Merges multiple events into a single event.
 *
 * Strategy:
 * - The first event (by array order) is the "target" and keeps its core properties
 *   (type, date, excerpt, body, draft, location)
 * - Relations are merged from all events:
 *   - links, media, keywords: combined with duplicates removed
 *   - payload.actors, payload.groups, payload.groupsMembers: combined with duplicates removed
 *   - stories: updated to reference the merged event
 * - Source events (all except first) are soft-deleted
 * - Returns the merged event
 */
export const mergeEventsFlow = <C extends MergeContext>(
  ids: readonly UUID[],
): TEReader<Event, C> => {
  // Deduplicate IDs to handle potential duplicates
  const uniqueIds = deduplicateIds(ids);

  if (uniqueIds.length < 2) {
    return fp.RTE.left(
      toBadRequestError("At least 2 unique event IDs are required to merge"),
    );
  }

  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("events", () => loadEventsWithRelationIds<C>(uniqueIds)),
    fp.RTE.bind("sorted", ({ events }) =>
      sortEventsByIdOrder<C>(uniqueIds, events),
    ),
    fp.RTE.bind("merged", ({ sorted }) =>
      buildMergedEventData<C>(
        [sorted.target, ...sorted.sources],
        sorted.target.type,
      ),
    ),
    fp.RTE.chain(({ events, sorted, merged }) =>
      executeMergeTransaction<C>(
        sorted.target,
        sorted.sourceIds,
        merged,
        events.map((e) => e.id),
      ),
    ),
  );
};
