import { toNotFoundError } from "@liexp/backend/lib/errors/NotFoundError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { PageEntity } from "#entities/Page.entity.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeDeletePageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.Page.Delete,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.findOne(PageEntity, { where: { id: Equal(id) } }),
        TE.chain(TE.fromOption(() => toNotFoundError("Page"))),
        TE.chainFirst(() => ctx.db.softDelete(PageEntity, id)),
        TE.chainEitherK(toPageIO),
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
