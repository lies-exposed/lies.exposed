import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { editActor } from "#flows/actors/editActor.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeEditActorRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Actor.Edit,
    ({
      params: { id },
      body: { memberIn, bornOn, diedOn, avatar, nationalities, ...body },
    }) => {
      ctx.logger.info.log("Actor update for id %s", id);

      return pipe(
        editActor({
          id,
          username: body.username,
          fullName: body.fullName,
          color: body.color,
          excerpt: pipe(
            body.excerpt,
            O.map((e) => e as any),
          ),
          body: pipe(
            body.body,
            O.map((b) => b as any),
          ),
          bornOn: pipe(
            bornOn,
            O.map((d) => d.toISOString()),
          ),
          diedOn: pipe(
            diedOn,
            O.map((d) => d.toISOString()),
          ),
          avatar,
          nationalities,
          memberIn: pipe(
            memberIn,
            O.map((members) => members as any),
          ),
        })(ctx),
        TE.map((actor) => ({
          body: {
            data: actor,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
