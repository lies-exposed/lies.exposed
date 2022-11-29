import { PageEntity } from "@entities/Page.entity";
import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { authenticationHandler } from "@utils/authenticationHandler";
import { Router } from "express";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { RouteContext } from "../route.types";
import { toPageIO } from "./page.io";

export const MakeAddPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
    Endpoints.Page.Create,
    ({ body }) => {
      return pipe(
        ctx.db.save(PageEntity, [
          { ...body, body: undefined, body2: body.body2 as any },
        ]),
        TE.chainEitherK(([page]) => toPageIO(page)),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
