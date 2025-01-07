import { PageEntity } from "@liexp/backend/lib/entities/Page.entity.js";
import { toNotFoundError } from "@liexp/backend/lib/errors/NotFoundError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type Route } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeEditPageRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["admin:edit"])(ctx))(
    Endpoints.Page.Edit,
    ({ params: { id }, body: { body2, ...editBody } }) => {
      return pipe(
        ctx.db.save(PageEntity, [
          {
            ...editBody,
            body2: body2,
            id,
          },
        ]),
        TE.chain(() =>
          ctx.db.findOne(PageEntity, { where: { id: Equal(id) } }),
        ),
        TE.chain(TE.fromOption(() => toNotFoundError("Page"))),
        TE.chainEitherK(toPageIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
