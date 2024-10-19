import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { KeywordIO } from "./keyword.io.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
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
