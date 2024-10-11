import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { MediaIO } from "./media.io.js";
import { createMediaFlow } from "#flows/media/createMedia.flow.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeCreateMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler([])(ctx))(
    Endpoints.Media.Create,
    ({ body }, req) => {
      ctx.logger.debug.log("Create media and upload %s", body);
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) => createMediaFlow(body, u)(ctx)),
        TE.chainEitherK((media) =>
          MediaIO.decodeSingle(media[0], ctx.env.SPACE_ENDPOINT),
        ),
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
