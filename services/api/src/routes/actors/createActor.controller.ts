import { searchActorAndCreateFromWikipedia } from "@flows/actors/fetchActorFromWikipedia";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { AddActorBody } from "@liexp/shared/lib/io/http/Actor";
import { authenticationHandler } from "@utils/authenticationHandler";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { ActorEntity } from "../../entities/Actor.entity";
import { type Route } from "../route.types";
import { toActorIO } from "./actor.io";

export const MakeCreateActorRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Actor.Create,
    ({ body, headers }) => {
      ctx.logger.debug.log("Headers %O", { headers, body });

      return pipe(
        AddActorBody.is(body)
          ? pipe(
              ctx.db.findOneOrFail(ActorEntity, {
                where: { username: body.username },
              }),
              TE.chain(() =>
                ctx.db.save(ActorEntity, [
                  {
                    ...body,
                    bornOn: body.bornOn?.toISOString(),
                    diedOn: body.diedOn?.toISOString(),
                    family: null
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
