import { PageEntity } from "@liexp/backend/lib/entities/Page.entity.js";
import { toNotFoundError } from "@liexp/backend/lib/errors/NotFoundError.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

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
