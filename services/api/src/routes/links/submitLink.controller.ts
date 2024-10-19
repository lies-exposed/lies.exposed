import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { LinkIO } from "./link.io.js";
import { type ServerContext } from "#context/context.type.js";
import { fetchAndSave } from "#flows/links/link.flow.js";
import { getOneAdminOrFail } from "#flows/users/getOneUserOrFail.flow.js";
import { type Route } from "#routes/route.types.js";

export const MakeSubmitLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Link.Custom.Submit, ({ body }, req) => {
    ctx.logger.debug.log("Body %O", body);

    return pipe(
      fp.RTE.ask<ServerContext>(),
      fp.RTE.chainTaskEitherK(getOneAdminOrFail),
      fp.RTE.chain((admin) => fetchAndSave(admin, body.url)),
      fp.RTE.chainEitherK(LinkIO.decodeSingle),
      fp.RTE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    )(ctx);
  });
};
