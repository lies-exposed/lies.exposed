import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { PageEntity } from "../../entities/Page.entity";
import { type RouteContext } from "../route.types";
import { toPageIO } from "./page.io";
import { NotFoundError } from "@io/ControllerError";
import { authenticationHandler } from "@utils/authenticationHandler";

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
        }))
      );
    }
  );
};
