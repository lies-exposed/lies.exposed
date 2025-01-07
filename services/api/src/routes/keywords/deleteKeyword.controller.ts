import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { KeywordIO } from "@liexp/backend/lib/io/keyword.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeDeleteKeywordRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])({ logger, jwt }))(
    Endpoints.Keyword.Delete,
    ({ params: { id } }) => {
      return pipe(
        db.findOneOrFail(KeywordEntity, {
          where: { id },
          loadRelationIds: true,
        }),
        TE.chainFirst(() =>
          sequenceS(TE.ApplicativeSeq)({
            actor: db.softDelete(KeywordEntity, id),
          }),
        ),
        TE.chainEitherK(KeywordIO.decodeSingle),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
