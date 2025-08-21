import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetMediaRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Media.Get, ({ params: { id } }, req) => {
    ctx.logger.debug.log("User decoded %O", req.user);

    return pipe(
      ctx.db.findOneOrFail(MediaEntity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["creator", "events", "keywords", "links", "areas"],
        },
        withDeleted: true,
      }),
      TE.chainEitherK((m) => MediaIO.decodeSingle(m)),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
