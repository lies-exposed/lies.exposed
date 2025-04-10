import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { KeywordIO } from "@liexp/backend/lib/io/keyword.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateKeywordRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(
    r,
    authenticationHandler([AdminCreate.literals[0]])({ logger, jwt }),
  )(Endpoints.Keyword.Create, ({ body }) => {
    logger.debug.log("Headers %O", { body });

    return pipe(
      db.findOne(KeywordEntity, { where: { tag: Equal(body.tag) } }),
      TE.filterOrElse(O.isNone, () =>
        ServerError.of([`Keyword ${body.tag} already exists.`]),
      ),
      TE.chain(() => db.save(KeywordEntity, [body])),
      TE.chain(([keyword]) =>
        db.findOneOrFail(KeywordEntity, {
          where: { id: keyword.id },
          loadRelationIds: true,
        }),
      ),
      TE.chainEitherK(KeywordIO.decodeSingle),
      TE.map((page) => ({
        body: {
          data: page,
        },
        statusCode: 201,
      })),
    );
  });
};
