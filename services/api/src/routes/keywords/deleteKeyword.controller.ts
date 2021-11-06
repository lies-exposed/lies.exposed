import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { toKeywordIO } from "./keyword.io";
import { KeywordEntity } from "@entities/Keyword.entity";
import { Route } from "@routes/route.types";

export const MakeDeleteKeywordRoute: Route = (r, { s3, db, env }) => {
  AddEndpoint(r)(Endpoints.Keyword.Delete, ({ params: { id } }) => {
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
  });
};
