import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { KeywordEntity } from "@entities/Keyword.entity";
import { Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { toKeywordIO } from "./keyword.io";

export const MakeDeleteKeywordRoute: Route = (
  r,
  { s3, db, env, logger, jwt }
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
          })
        ),
        TE.chainEitherK(toKeywordIO),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
