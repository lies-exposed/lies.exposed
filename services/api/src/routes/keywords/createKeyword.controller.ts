import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { KeywordIO } from "./keyword.io.js";
import { KeywordEntity } from "#entities/Keyword.entity.js";
import { ServerError } from "#io/ControllerError.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateKeywordRoute: Route = (r, { db, logger, jwt }) => {
  AddEndpoint(r, authenticationHandler({ logger, jwt }, ["admin:create"]))(
    Endpoints.Keyword.Create,
    ({ body, headers }) => {
      logger.debug.log("Headers %O", { headers, body });

      return pipe(
        db.findOne(KeywordEntity, { where: { tag: Equal(body.tag) } }),
        TE.filterOrElse(O.isNone, () =>
          ServerError([`Keyword ${body.tag} already exists.`]),
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
    },
  );
};
