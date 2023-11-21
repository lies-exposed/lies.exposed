import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toLinkIO } from "./link.io";
import { fetchAndSave } from "@flows/links/link.flow";
import { getOneAdminOrFail } from "@flows/users/getOneUserOrFail.flow";
import { type RouteContext } from "@routes/route.types";

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
