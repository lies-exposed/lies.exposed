import { getOneAdminOrFail } from "@liexp/backend/lib/flows/user/getOneUserOrFail.flow.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type ServerContext } from "#context/context.type.js";
import { fetchAndSave } from "#flows/links/link.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeSubmitLinkRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Link.Custom.Submit, ({ body }, _req) => {
    ctx.logger.debug.log("Body %O", body);

    return pipe(
      fp.RTE.ask<ServerContext>(),
      fp.RTE.chainTaskEitherK(getOneAdminOrFail),
      fp.RTE.chain((admin) => fetchAndSave(admin, body.url)),
      fp.RTE.chainEitherK((l) => LinkIO.decodeSingle(l)),
      fp.RTE.map((data) => ({
        body: { data },
        statusCode: 200,
      })),
    )(ctx);
  });
};
