import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import {
  AddActorBody,
  type CreateActorBody,
} from "@liexp/shared/lib/io/http/Actor.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { ActorEntity } from "../../entities/Actor.entity.js";
import { type Route } from "../route.types.js";
import { ActorIO } from "./actor.io.js";
import { searchActorAndCreateFromWikipedia } from "#flows/actors/fetchAndCreateActorFromWikipedia.js";
import { type TEReader } from "#flows/flow.types.js";
import { ServerError } from "#io/ControllerError.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const createActor =
  (body: CreateActorBody): TEReader<ActorEntity> =>
  (ctx) => {
    if (AddActorBody.is(body)) {
      return pipe(
        ctx.db.findOne(ActorEntity, {
          where: { username: body.username },
        }),
        TE.filterOrElse(O.isNone, () => ServerError()),
        TE.chain(() =>
          ctx.db.save(ActorEntity, [
            {
              ...body,
              avatar: body.avatar ? { id: body.avatar } : null,
              bornOn: body.bornOn?.toISOString(),
              diedOn: body.diedOn?.toISOString(),
            },
          ]),
        ),
        TE.map(([actor]) => actor),
      );
    }
    return searchActorAndCreateFromWikipedia(body.search, "wikipedia")(ctx);
  };

export const MakeCreateActorRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminCreate.value])(ctx))(
    Endpoints.Actor.Create,
    ({ body, headers }) => {
      ctx.logger.debug.log("Headers %O", { headers, body });

      return pipe(
        createActor(body)(ctx),
        TE.chain((actor) =>
          ctx.db.findOneOrFail(ActorEntity, {
            where: { id: Equal(actor.id) },
          }),
        ),
        TE.chainEitherK((a) => ActorIO.decodeSingle(a, ctx.env.SPACE_ENDPOINT)),
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
