import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import { createExcerptValue } from "@liexp/react-page/lib/utils.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { type AddActorBody } from "@liexp/shared/lib/io/http/Actor.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { fetchFromWikipedia } from "#flows/wikipedia/fetchFromWikipedia.js";
import { NotFoundError, toControllerError } from "#io/ControllerError.js";
import { editor } from "#providers/slate";

export const fetchActorFromWikipedia: TEFlow<[string], AddActorBody> =
  (ctx) => (pageId) => {
    return pipe(
      fetchFromWikipedia(ctx)(pageId),
      TE.map(({ page, featuredMedia: avatar, intro }) => {
        ctx.logger.debug.log("Actor fetched from wikipedia %s", page.title);
        const username = pipe(
          page.fullurl.split("/"),
          fp.A.last,
          fp.O.map(getUsernameFromDisplayName),
          fp.O.getOrElse(() => getUsernameFromDisplayName(pageId)),
        );

        const excerpt = createExcerptValue(editor.liexpSlate)(intro);
        return {
          fullName: page.title,
          username,
          avatar,
          excerpt,
          color: generateRandomColor(),
          body: {},
          bornOn: undefined,
          diedOn: undefined,
        };
      }),
    );
  };

export const fetchAndCreateActorFromWikipedia: TEFlow<[string], ActorEntity> = (
  ctx,
) =>
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
 *
 * @param ctx - RouteContext
 * @param search - string to search on wikipedia
 * @returns
 */
export const searchActorAndCreateFromWikipedia: TEFlow<[string], ActorEntity> =
  (ctx) => (search) => {
    return pipe(
      ctx.wp.search(search),
      TE.mapLeft(toControllerError),
      TE.filterOrElse(
        (r) => !!r.results[0],
        () => NotFoundError(`Actor ${search} on wikipedia`),
      ),
      TE.chain((p) =>
        fetchAndCreateActorFromWikipedia(ctx)(p.results[0].pageid),
      ),
    );
  };
