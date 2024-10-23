import { toNotFoundError } from "@liexp/backend/lib/errors/NotFoundError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { PageEntity } from "../../entities/Page.entity.js";
import { type Route } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetPageRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Page.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOne(PageEntity, { where: { id: Equal(id) } }),
      TE.chain(TE.fromOption(() => toNotFoundError("Page"))),
      TE.chainEitherK(toPageIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
