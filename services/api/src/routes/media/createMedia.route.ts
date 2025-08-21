import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { UserRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { createMediaFlow } from "#flows/media/createMedia.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeCreateMediaRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([])(ctx))(
    Endpoints.Media.Create,
    ({ body }, req) => {
      ctx.logger.debug.log("Create media and upload %s", body);
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) =>
          UserRepository.findOneOrFail({ where: { id: Equal(u.id) } })(ctx),
        ),
        TE.chain((u) => createMediaFlow(body, u)(ctx)),
        TE.chainEitherK((media) => MediaIO.decodeSingle(media[0])),
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
