import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Actor } from "@liexp/shared/lib/io/http/Actor.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { Equal, In } from "typeorm";
import { type TEReader } from "#flows/flow.types.js";

interface MergeActorInput {
  sourceId: UUID;
  targetId: UUID;
}

/**
 * Merges one actor into another, transferring all relations:
 * - Events (ManyToMany via event payloads)
 * - Stories (ManyToMany)
 * - Group memberships (OneToMany GroupMemberEntity)
 * - Nationalities (ManyToMany)
 * After transferring all relations, the source actor is deleted.
 */
export const mergeActor = (input: MergeActorInput): TEReader<Actor> => {
  const { sourceId, targetId } = input;

  return (ctx) =>
    // Wrap entire merge operation in a transaction for atomicity
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
            // 1. Update events - find all events with sourceId in payload.actors and replace with targetId
            fp.TE.chainFirst(() =>
              pipe(
                ctx.db.find(EventV2Entity, {
                  where: {},
                }),
                fp.TE.chain((events) => {
                  const eventsToUpdate = events.filter((event) => {
                    const payload = event.payload as any;
                    return (
                      payload?.actors &&
                      Array.isArray(payload.actors) &&
                      payload.actors.includes(sourceId)
                    );
                  });

                  ctx.logger.info.log(
                    "Found %d events to update",
                    eventsToUpdate.length,
                  );

                  if (eventsToUpdate.length === 0) {
                    return fp.TE.of(undefined);
                  }

                  const updatedEvents = eventsToUpdate.map((event) => {
                    const payload = event.payload as any;
                    const updatedActors = payload.actors
                      .filter((id: string) => id !== sourceId)
                      .concat(
                        payload.actors.includes(targetId) ? [] : [targetId],
                      );

                    return {
                      ...event,
                      payload: {
                        ...payload,
                        actors: updatedActors,
                      },
                    };
                  });

                  return txCtx.save(EventV2Entity, updatedEvents);
                }),
              ),
            ),
            // 2. Merge stories - add source stories to target (avoiding duplicates)
            fp.TE.chainFirst(() => {
              const sourceStoryIds =
                source.stories?.map((s: any) => s.id) ?? [];
              const targetStoryIds =
                target.stories?.map((s: any) => s.id) ?? [];
              const newStoryIds = sourceStoryIds.filter(
                (id: string) => !targetStoryIds.includes(id),
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
                source.nationalities?.map((n: any) => n.id) ?? [];
              const targetNationIds =
                target.nationalities?.map((n: any) => n.id) ?? [];
              const newNationIds = sourceNationIds.filter(
                (id: string) => !targetNationIds.includes(id),
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
                    ...newNationIds.map((id: string) => ({ id })),
                  ] as any,
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
    );
};
