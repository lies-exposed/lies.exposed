import { NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { NationIO } from "@liexp/backend/lib/io/Nation.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetNationRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Nation.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(NationEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainEitherK((nation) => NationIO.decodeSingle(nation)),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
