import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { KeywordIO } from "@liexp/backend/lib/io/keyword.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditKeywordsRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])({ logger, jwt }))(
    Endpoints.Keyword.Edit,
    ({ params: { id }, body }) => {
      logger.debug.log("Actor update data %O", body);
      return pipe(
        db.save(KeywordEntity, [{ id, ...body }]),
        TE.chain(() =>
          db.findOneOrFail(KeywordEntity, {
            where: { id },
            loadRelationIds: true,
          }),
        ),
        TE.chainEitherK(KeywordIO.decodeSingle),
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
