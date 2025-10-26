import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { StoryIO } from "@liexp/backend/lib/io/story.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AdminDelete } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeDeleteStoryRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler([AdminDelete.literals[0]])(ctx))(
    Endpoints.Story.Delete,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.findOneOrFail(StoryEntity, { where: { id: Equal(id) } }),
        TE.chainFirst((e) =>
          e.deletedAt
            ? ctx.db.delete(StoryEntity, [id])
            : ctx.db.softDelete(StoryEntity, [id]),
        ),
        TE.chainEitherK(StoryIO.decodeSingle),
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
