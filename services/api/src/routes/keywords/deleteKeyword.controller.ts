import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { toKeywordIO } from "./keyword.io.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeDeleteKeywordRoute: Route = (
  r,
  { s3, db, env, logger, jwt },
) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:delete"]))(
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
        TE.chainEitherK(toKeywordIO),
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
