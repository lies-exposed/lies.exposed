import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { type RouteContext } from "../route.types.js";
import { toPageIO } from "./page.io.js";
import { PageEntity } from "#entities/Page.entity.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeAddPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:create"]))(
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
          statusCode: 200,
        })),
      );
    },
  );
};
