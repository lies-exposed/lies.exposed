import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { StoryIO } from "./story.io.js";
import { StoryEntity } from "#entities/Story.entity.js";

export const MakeGetStoryRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Story.Get, ({ params: { id } }) => {
    return pipe(
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
      }),
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
