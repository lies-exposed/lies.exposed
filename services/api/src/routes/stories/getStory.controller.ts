import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type Route } from "../route.types";
import { toStoryIO } from "./story.io";
import { StoryEntity } from "@entities/Story.entity";

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
      TE.chainEitherK(toStoryIO),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      })),
    );
  });
};
