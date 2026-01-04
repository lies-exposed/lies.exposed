import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import {
  type SearchEventOutput,
  searchEventV2Query,
} from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { replaceActorInEventPayload } from "@liexp/shared/lib/helpers/event/replaceActorInEventPayload.js";
import { type Actor } from "@liexp/shared/lib/io/http/Actor.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import * as O from "effect/Option";
import { Equal, In } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";
import { type ControllerError } from "#io/ControllerError.js";

interface MergeActorInput {
  sourceId: UUID;
  targetId: UUID;
}

/**
 * Merges one actor into another, transferring these relations:
 * - Events (ManyToMany via event payloads)
 * - Stories (ManyToMany)
 * - Nationalities (ManyToMany)
 *
 * Group memberships (OneToMany GroupMemberEntity) are NOT transferred and will
 * be soft-deleted via cascade when the source actor is deleted.
 */
export const mergeActor = (input: MergeActorInput): TEReader<Actor> => {
  const { sourceId, targetId } = input;

  return (ctx) =>
    pipe(
      // First, fetch all events for the source actor using the proper query
      // This happens outside the transaction since it's read-only
      walkPaginatedRequest<SearchEventOutput, ControllerError, EventV2Entity>(
        ({ skip, amount }) =>
          searchEventV2Query({
            actors: O.some([sourceId]),
            skip,
            take: amount,
          })(ctx),
        (r) => r.total,
        (r) => fp.TE.right(r.results),
        0,
        100,
      )(ctx),
      // Now wrap the merge operation in a transaction for atomicity
      fp.TE.chain((eventsWithSourceActor) =>
        ctx.db.transaction((txCtx) =>
          pipe(
            // Load both actors with their relations
            fp.TE.Do,
            fp.TE.bind("source", () =>
              txCtx.findOneOrFail(ActorEntity, {
                where: { id: Equal(sourceId) },
                relations: [
                  "memberIn",
                  "memberIn.group",
                  "stories",
                  "nationalities",
                ],
              }),
            ),
            fp.TE.bind("target", () =>
              txCtx.findOneOrFail(ActorEntity, {
                where: { id: Equal(targetId) },
                relations: ["memberIn", "stories", "nationalities"],
              }),
            ),
            fp.TE.chain(({ source, target }) => {
              ctx.logger.info.log(
                "Merging actor %s (%s) into %s (%s)",
                source.fullName,
                sourceId,
                target.fullName,
                targetId,
              );

              return pipe(
                fp.TE.Do,
                // 1. Update events - replace sourceId with targetId in event payloads
                fp.TE.chainFirst(() => {
                  ctx.logger.info.log(
                    "Found %d events to update",
                    eventsWithSourceActor.length,
                  );

                  if (eventsWithSourceActor.length === 0) {
                    return fp.TE.of(undefined);
                  }

                  // Reload events within transaction context
                  const eventIds = eventsWithSourceActor.map((e) => e.id);
                  return pipe(
                    txCtx.find(EventV2Entity, {
                      where: { id: In(eventIds) },
                    }),
                    fp.TE.chain((events) => {
                      // Update each event's payload to replace sourceId with targetId
                      const updatedEvents = events.map((event) =>
                        replaceActorInEventPayload(event, { sourceId, targetId }),
                      );

                      return txCtx.save(EventV2Entity, updatedEvents);
                    }),
                  );
                }),
                // 2. Merge stories - add source stories to target (avoiding duplicates)
                fp.TE.chainFirst(() => {
                  const sourceStoryIds = source.stories?.map((s) => s.id) ?? [];
                  const targetStoryIds = target.stories?.map((s) => s.id) ?? [];
                  const newStoryIds = sourceStoryIds.filter(
                    (id) => !targetStoryIds.includes(id),
                  );

                  if (newStoryIds.length === 0) {
                    return fp.TE.of(undefined);
                  }

                  ctx.logger.info.log(
                    "Adding %d stories to target actor",
                    newStoryIds.length,
                  );

                  return pipe(
                    txCtx.find(StoryEntity, {
                      where: { id: In(newStoryIds) },
                      relations: ["actors"],
                    }),
                    fp.TE.chain((stories) => {
                      const updatedStories = stories.map((story) => ({
                        ...story,
                        actors: [...(story.actors ?? []), target],
                      }));
                      return txCtx.save(StoryEntity, updatedStories);
                    }),
                  );
                }),
                // 3. Group memberships are NOT transferred - they cascade soft-delete with source actor
                // Note: Group memberships are handled by cascade rules on ActorEntity.memberIn
                // 4. Merge nationalities - add source nationalities to target (avoiding duplicates)
                fp.TE.chainFirst(() => {
                  const sourceNationIds =
                    source.nationalities?.map((n) => n.id) ?? [];
                  const targetNationIds =
                    target.nationalities?.map((n) => n.id) ?? [];
                  const newNationIds = sourceNationIds.filter(
                    (id) => !targetNationIds.includes(id),
                  );

                  if (newNationIds.length === 0) {
                    return fp.TE.of(undefined);
                  }

                  ctx.logger.info.log(
                    "Adding %d nationalities to target actor",
                    newNationIds.length,
                  );

                  return txCtx.save(ActorEntity, [
                    {
                      ...target,
                      nationalities: [
                        ...(target.nationalities ?? []),
                        ...newNationIds.map((id) => ({ id }) as { id: UUID }),
                      ],
                    },
                  ]);
                }),
                // 5. Delete the source actor
                fp.TE.chainFirst(() => {
                  ctx.logger.info.log("Deleting source actor %s", sourceId);
                  return txCtx.softDelete(ActorEntity, sourceId);
                }),
                // 6. Return the updated target actor
                fp.TE.chain(() =>
                  txCtx.findOneOrFail(ActorEntity, {
                    where: { id: Equal(targetId) },
                    loadRelationIds: {
                      relations: ["memberIn"],
                    },
                  }),
                ),
                fp.TE.chainEitherK((actor) => ActorIO.decodeSingle(actor)),
              );
            }),
          ),
        ),
      ),
    );
};
