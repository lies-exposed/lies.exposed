import { ActorIO } from "@liexp/backend/lib/io/Actor.io.js";
import { fetchActors } from "@liexp/backend/lib/queries/actors/fetchActors.query.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeListPageRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Actor.List, ({ query }) => {
    return pipe(
      fetchActors(query)(ctx),
      TE.chain(({ results, total }) =>
        pipe(
          ActorIO.decodeMany(results, ctx.env.SPACE_ENDPOINT),
          TE.fromEither,
          TE.map((results) => ({
            total,
            data: results,
          })),
        ),
      ),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      })),
    );
  });
};
