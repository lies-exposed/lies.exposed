import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { KeywordIO } from "@liexp/backend/lib/io/keyword.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetKeywordRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Keyword.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(KeywordEntity, {
        where: { id },
        loadRelationIds: true,
      }),
      TE.chainEitherK(KeywordIO.decodeSingle),
      TE.map((actor) => ({
        body: {
          data: actor,
        },
        statusCode: 200,
      })),
    );
  });
};
