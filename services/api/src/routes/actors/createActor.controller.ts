import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { AddActorBody } from "@liexp/shared/lib/io/http/Actor";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { ActorEntity } from "../../entities/Actor.entity";
import { type Route } from "../route.types";
import { toActorIO } from "./actor.io";
import { searchActorAndCreateFromWikipedia } from "@flows/actors/fetchActorFromWikipedia";
import { ServerError } from "@io/ControllerError";
import { authenticationHandler } from "@utils/authenticationHandler";

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
                ])
              ),
              TE.map(([actor]) => actor)
            )
          : searchActorAndCreateFromWikipedia(ctx)(body.search),

        TE.chain((actor) =>
          ctx.db.findOneOrFail(ActorEntity, {
            where: { id: Equal(actor.id) },
          })
        ),
        TE.chainEitherK(toActorIO),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
