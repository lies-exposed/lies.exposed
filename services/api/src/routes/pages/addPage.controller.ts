import { PageEntity } from "@liexp/backend/lib/entities/Page.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeAddPageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:create"])(ctx))(
    Endpoints.Page.Create,
    ({ body }) => {
      return pipe(
        ctx.db.save(PageEntity, [
          { ...body, body: undefined, body2: body.body2 },
        ]),
        TE.chainEitherK(([page]) => toPageIO(page)),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
