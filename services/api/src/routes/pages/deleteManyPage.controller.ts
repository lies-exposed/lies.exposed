import { PageEntity } from "@liexp/backend/lib/entities/Page.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { In } from "typeorm";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeDeleteManyPageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:delete"])(ctx))(
    Endpoints.Page.Custom.DeleteMany,
    ({ query: { ids } }) => {
      return pipe(
        ctx.db.find(PageEntity, { where: { id: In(ids) } }),
        TE.chainFirst(() => ctx.db.softDelete(PageEntity, [...ids])),
        TE.map(() => ({
          body: { data: ids },
          statusCode: 200,
        })),
      );
    },
  );
};
