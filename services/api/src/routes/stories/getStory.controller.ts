import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { RequestDecoder } from "@liexp/backend/lib/express/decoders/request.decoder.js";
import { StoryIO } from "@liexp/backend/lib/io/story.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { AdminRead } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";

export const MakeGetStoryRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Story.Get, ({ params: { id } }, r) => {
    return pipe(
      RequestDecoder.decodeNullableUser(r, [AdminRead.literals[0]])(ctx),
      TE.fromIO,
      TE.chain((user) =>
        ctx.db.findOneOrFail(StoryEntity, {
          where: { id },
          relations: ["featuredImage"],
          loadRelationIds: {
            relations: [
              "creator",
              "keywords",
              "events",
              "groups",
              "actors",
              "media",
            ],
          },
          withDeleted: !!user,
        }),
      ),
      TE.chainEitherK(StoryIO.decodeSingle),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
