import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type AddActorBody } from "@liexp/shared/lib/io/http/Actor.js";
import { uuid, UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import {
  fetchFromWikipedia,
  type WikiProviders,
} from "#flows/wikipedia/fetchFromWikipedia.js";
import { NotFoundError, toControllerError } from "#io/ControllerError.js";
import { getWikiProvider } from "#services/entityFromWikipedia.service.js";

export const fetchActorFromWikipedia: TEFlow<
  [string, WikiProviders],
  AddActorBody
> = (ctx) => (title, wp) => {
  return pipe(
    fetchFromWikipedia(getWikiProvider(ctx)(wp))(title),
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

export const fetchAndCreateActorFromWikipedia: TEFlow<
  [string, WikiProviders],
  ActorEntity
> = (ctx) =>
  flow(
    fetchActorFromWikipedia(ctx),
    TE.chain((actor) =>
      pipe(
        ctx.db.findOne(ActorEntity, {
          where: {
            username: Equal(actor.username),
          },
        }),
        ctx.logger.debug.logInTaskEither(`Actor %O`),
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
 * @param ctx - RouteContext
 * @param search - string to search on wikipedia
 * @returns
 */
export const searchActorAndCreateFromWikipedia: TEFlow<
  [string, WikiProviders],
  ActorEntity
> = (ctx) => (search, wp) => {
  return pipe(
    ctx.wp.search(search),
    TE.mapLeft(toControllerError),
    TE.filterOrElse(
      (r) => !!r[0],
      () => NotFoundError(`Actor ${search} on wikipedia`),
    ),
    TE.chain((p) => fetchAndCreateActorFromWikipedia(ctx)(p[0].title, wp)),
  );
};
