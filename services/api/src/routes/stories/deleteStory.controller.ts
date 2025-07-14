import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { StoryIO } from "@liexp/backend/lib/io/story.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { AdminDelete } from "@liexp/shared/lib/io/http/User.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

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
