import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toStoryIO } from "./story.io";
import { StoryEntity } from "@entities/Story.entity";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeDeleteStoryRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["admin:delete"]))(
    Endpoints.Story.Delete,
    ({ params: { id } }, r) => {
      return pipe(
        ctx.db.findOneOrFail(StoryEntity, { where: { id: Equal(id) } }),
        TE.chainFirst((e) => ctx.db.delete(StoryEntity, [id])),
        TE.chainEitherK(toStoryIO),
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
