import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { PageEntity } from "../../entities/Page.entity";
import { type RouteContext } from "../route.types";
import { toPageIO } from "./page.io";
import { NotFoundError } from "@io/ControllerError";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeEditPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:edit"]))(
    Endpoints.Page.Edit,
    ({ params: { id }, body: { body2, ...editBody } }) => {
      return pipe(
        ctx.db.save(PageEntity, [
          {
            ...editBody,
            body2: body2 as any,
            id,
          },
        ]),
        TE.chain(() =>
          ctx.db.findOne(PageEntity, { where: { id: Equal(id) } }),
        ),
        TE.chain(TE.fromOption(() => NotFoundError("Page"))),
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
