import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { RouteContext } from "../route.types";
import { LinkEntity } from "@entities/Link.entity";
import { NotFoundError } from "@io/ControllerError";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeDeleteLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:delete"]))(
    Endpoints.Link.Delete,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.findOne(LinkEntity, { where: { id: Equal(id) } }),
        TE.chain(TE.fromOption(() => NotFoundError("Link"))),
        TE.chainFirst(() => ctx.db.softDelete(LinkEntity, id)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        }))
      );
    }
  );
};
