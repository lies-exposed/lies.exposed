import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toLinkIO } from "./link.io.js";
import { fetchAndSave } from "#flows/links/link.flow.js";
import { getOneAdminOrFail } from "#flows/users/getOneUserOrFail.flow.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeSubmitLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Link.Custom.Submit, ({ body }, req) => {
    ctx.logger.debug.log("Body %O", body);

    return pipe(
      getOneAdminOrFail(ctx),
      TE.chain((admin) => fetchAndSave(ctx)(admin, body.url)),
      TE.chainEitherK(toLinkIO),
      TE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    );
  });
};
