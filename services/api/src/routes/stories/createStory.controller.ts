import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { StoryIO } from "./story.io.js";
import { StoryEntity } from "#entities/Story.entity.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const MakeCreateStoryRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["event-suggestion:create"])(ctx))(
    Endpoints.Story.Create,
    (
      { body: { body2, actors, groups, media, events, keywords, ...body } },
      r,
    ) => {
      const featuredImage = pipe(body.featuredImage, O.toNullable);
      return pipe(
        ctx.db.save(StoryEntity, [
          {
            ...body,
            body: "",
            body2: body2 as any,
            creator: { id: r.user?.id },
            keywords: keywords.map((k) => ({ id: k })),
            actors: actors.map((k) => ({ id: k })),
            groups: groups.map((k) => ({ id: k })),
            media: media.map((m) => ({ id: m })),
            events: events.map((e) => ({ id: e })),
            featuredImage: featuredImage ? { id: featuredImage } : null,
          },
        ]),
        TE.chain(([story]) =>
          ctx.db.findOneOrFail(StoryEntity, {
            where: { id: story.id },
            relations: ["featuredImage"],
            loadRelationIds: {
              relations: ["keywords"],
            },
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
    },
  );
};
