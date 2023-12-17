import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor.js";
import { type AddActorBody } from "@liexp/shared/lib/io/http/Actor.js";
import { createExcerptValue } from "@liexp/shared/lib/slate/index.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { fetchFromWikipedia } from "#flows/wikipedia/fetchFromWikipedia.js";
import { NotFoundError, toControllerError } from "#io/ControllerError.js";

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

        const excerpt = createExcerptValue(intro);
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

export const searchActorAndCreateFromWikipedia: TEFlow<[string], ActorEntity> =
  (ctx) => (search) => {
    return pipe(
      ctx.db.findOne(ActorEntity, {
        where: {
          username: Equal(getUsernameFromDisplayName(search)),
        },
      }),
      ctx.logger.debug.logInTaskEither(`Actor %O`),
      TE.chain((actor) =>
        fp.O.isSome(actor)
          ? TE.right(actor.value)
          : pipe(
              ctx.wp.search(search),
              TE.mapLeft(toControllerError),
              TE.filterOrElse(
                (r) => !!r.results[0],
                () => NotFoundError(`Actor ${search} on wikipedia`),
              ),
              TE.chain((p) =>
                fetchActorFromWikipedia(ctx)(p.results[0].pageid),
              ),
              TE.chain((a) =>
                ctx.db.save(ActorEntity, [
                  {
                    ...a,
                    bornOn: a.bornOn?.toISOString(),
                    diedOn: a.diedOn?.toISOString(),
                  },
                ]),
              ),
              TE.map((r) => r[0]),
            ),
      ),
    );
  };
