import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Route } from "../route.types";
import { toKeywordIO } from "./keyword.io";
import { KeywordEntity } from "@entities/Keyword.entity";
import { ServerError } from "@io/ControllerError";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateKeywordRoute: Route = (r, { db, logger }) => {
  AddEndpoint(r, authenticationHandler(logger))(
    Endpoints.Keyword.Create,
    ({ body, headers }) => {
      logger.debug.log("Headers %O", { headers, body });

      return pipe(
        db.findOne(KeywordEntity, { where: { tag: body.tag } }),
        TE.filterOrElse(O.isNone, () => ServerError([`Keyword ${body.tag} already exists.`])),
        TE.chain(() => db.save(KeywordEntity, [body])),
        TE.chain(([keyword]) =>
          db.findOneOrFail(KeywordEntity, {
            where: { id: keyword.id },
            loadRelationIds: true,
          })
        ),
        TE.chainEitherK(toKeywordIO),
        TE.map((page) => ({
          body: {
            data: page,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
