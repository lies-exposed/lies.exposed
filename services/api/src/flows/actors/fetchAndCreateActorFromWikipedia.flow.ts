import { toNotFoundError } from "@liexp/backend/lib/errors/NotFoundError.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type AddActorBody } from "@liexp/shared/lib/io/http/Actor.js";
import { uuid, UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type ServerContext } from "#context/context.type.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import {
  fetchFromWikipedia,
  type WikiProviders,
} from "#flows/wikipedia/fetchFromWikipedia.js";
import { toControllerError } from "#io/ControllerError.js";
import { getWikiProvider } from "#services/entityFromWikipedia.service.js";

export const fetchActorFromWikipedia =
  (title: string, wp: WikiProviders): TEReader<AddActorBody> =>
  (ctx) => {
    return pipe(
      fetchFromWikipedia(title)(getWikiProvider(wp)(ctx)),
      TE.chain(({ featuredMedia: avatar, intro, slug }) => {
        ctx.logger.debug.log("Actor fetched from wikipedia %s", title);

        return pipe(
          toInitialValue(intro),
          TE.right,
          TE.mapLeft(toControllerError),
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
                  type: ImageType.types[0].value,
                  events: [],
                  links: [],
                  keywords: [],
                  areas: [],
                }
              : undefined,
            excerpt: excerpt,
            color: generateRandomColor(),
            body: undefined,
            bornOn: undefined,
            diedOn: undefined,
          })),
        );
      }),
    );
  };

export const fetchAndCreateActorFromWikipedia =
  (title: string, wp: WikiProviders): TEReader<ActorEntity> =>
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
                avatar: UUID.is(actor.avatar)
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
): TEReader<ActorEntity> => {
  return pipe(
    fp.RTE.ask<ServerContext>(),
    fp.RTE.chainTaskEitherK((ctx) => ctx.wp.search(search)),
    fp.RTE.mapLeft(toControllerError),
    fp.RTE.filterOrElse(
      (r) => !!r[0],
      () => toNotFoundError(`Actor ${search} on wikipedia`),
    ),
    fp.RTE.chain((p) => fetchAndCreateActorFromWikipedia(p[0].title, wp)),
  );
};
