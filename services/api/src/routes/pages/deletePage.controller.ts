import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { type RouteContext } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { PageEntity } from "#entities/Page.entity.js";
import { NotFoundError } from "#io/ControllerError.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeDeletePageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:delete"]))(
    Endpoints.Page.Delete,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.findOne(PageEntity, { where: { id: Equal(id) } }),
        TE.chain(TE.fromOption(() => NotFoundError("Page"))),
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
