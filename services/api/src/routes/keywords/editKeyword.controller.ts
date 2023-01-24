import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toKeywordIO } from "./keyword.io";
import { KeywordEntity } from "@entities/Keyword.entity";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeEditKeywordsRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:edit"]))(
    Endpoints.Keyword.Edit,
    ({ params: { id }, body }) => {
      logger.debug.log("Actor update data %O", body);
      return pipe(
        db.save(KeywordEntity, [{ id, ...body }]),
        TE.chain(() =>
          db.findOneOrFail(KeywordEntity, {
            where: { id },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toKeywordIO),
        TE.map((actor) => ({
          body: {
            data: actor,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
