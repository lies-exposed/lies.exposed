import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AddActorBody } from "@liexp/shared/lib/io/http/Actor.js";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { ActorEntity } from "../../entities/Actor.entity.js";
import { type Route } from "../route.types.js";
import { toActorIO } from "./actor.io.js";
import { searchActorAndCreateFromWikipedia } from "#flows/actors/fetchAndCreateActorFromWikipedia.js";
import { ServerError } from "#io/ControllerError.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateActorRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Actor.Create,
    ({ body, headers }) => {
      ctx.logger.debug.log("Headers %O", { headers, body });

      return pipe(
        AddActorBody.is(body)
          ? pipe(
              ctx.db.findOne(ActorEntity, {
                where: { username: body.username },
              }),
              TE.filterOrElse(O.isNone, () => ServerError()),
              TE.chain(() =>
                ctx.db.save(ActorEntity, [
                  {
                    ...body,
                    bornOn: body.bornOn?.toISOString(),
                    diedOn: body.diedOn?.toISOString(),
                  },
                ]),
              ),
              TE.map(([actor]) => actor),
            )
          : searchActorAndCreateFromWikipedia(ctx)(body.search),

        TE.chain((actor) =>
          ctx.db.findOneOrFail(ActorEntity, {
            where: { id: Equal(actor.id) },
          }),
        ),
        TE.chainEitherK(toActorIO),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
