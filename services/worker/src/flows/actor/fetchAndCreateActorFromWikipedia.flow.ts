import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { toNotFoundError } from "@liexp/backend/lib/errors/NotFoundError.js";
import {
  fetchFromWikipedia,
  type WikiProviders,
} from "@liexp/backend/lib/flows/wikipedia/fetchFromWikipedia.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type AddActorBody } from "@liexp/shared/lib/io/http/Actor.js";
import { uuid, UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type RTE } from "../../types.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError, type WorkerError } from "#io/worker.error.js";
import { getWikiProvider } from "#services/entityFromWikipedia.service.js";

export const fetchActorFromWikipedia =
  (title: string, wp: WikiProviders): RTE<AddActorBody> =>
  (ctx) => {
    return pipe(
      fetchFromWikipedia(title)(getWikiProvider(wp)(ctx)),
      TE.mapLeft(toWorkerError),
      TE.chain(({ featuredMedia: avatar, intro, slug }) => {
        ctx.logger.debug.log(
          "Actor fetched from wikipedia %s (%s)",
          title,
          slug,
        );

        return pipe(
          toInitialValue(intro),
          TE.right,
          TE.mapLeft(toWorkerError),
          TE.map((excerpt) => ({
            fullName: title,
            username: slug,
            avatar: avatar
              ? {
                  id: uuid(),
                  label: title,
                  description: intro,
                  location: avatar,
                  thumbnail: undefined,
                  extra: undefined,
                  type: ImageType.members[0].literals[0],
                  events: [],
                  links: [],
                  keywords: [],
                  areas: [],
                }
              : undefined,
            excerpt: excerpt,
            color: generateRandomColor(),
            nationalities: [],
            body: undefined,
            bornOn: undefined,
            diedOn: undefined,
          })),
        );
      }),
    );
  };

export const fetchAndCreateActorFromWikipedia =
  (title: string, wp: WikiProviders): RTE<ActorEntity> =>
  (ctx) =>
    pipe(
      fetchActorFromWikipedia(title, wp)(ctx),
      TE.chain((actor) =>
        pipe(
          ctx.db.findOne(ActorEntity, {
            where: {
              username: Equal(actor.username),
            },
          }),
          LoggerService.TE.debug(ctx, [`Actor %O`]),
          TE.chain((a) => {
            if (fp.O.isSome(a)) {
              return TE.right([a.value]);
            }
            return ctx.db.save(ActorEntity, [
              {
                ...actor,
                nationalities: [],
                avatar: Schema.is(UUID)(actor.avatar)
                  ? { id: actor.avatar }
                  : {
                      ...actor.avatar,
                      events: [],
                      links: [],
                      areas: [],
                      keywords: [],
                    },
                bornOn: actor.bornOn?.toISOString(),
                diedOn: actor.diedOn?.toISOString(),
              },
            ]);
          }),
          TE.map((r) => r[0]),
        ),
      ),
    );

/**
 * Search the given "search" string on wikipedia and create an actor from the first result.
 * @param ctx - ServerContext
 * @param search - string to search on wikipedia
 * @returns
 */
export const searchActorAndCreateFromWikipedia = (
  search: string,
  wp: WikiProviders,
): RTE<ActorEntity> => {
  return pipe(
    fp.RTE.ask<WorkerContext>(),
    fp.RTE.chainTaskEitherK((ctx) => ctx.wp.search(search)),
    fp.RTE.mapLeft(toWorkerError),
    fp.RTE.filterOrElse(
      (r) => !!r[0],
      (): WorkerError => toNotFoundError(`Actor ${search} on wikipedia`),
    ),
    fp.RTE.chain((p) => fetchAndCreateActorFromWikipedia(p[0].title, wp)),
  );
};
