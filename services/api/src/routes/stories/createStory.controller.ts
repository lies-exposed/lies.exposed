import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toStoryIO } from "./story.io";
import { StoryEntity } from "@entities/Story.entity";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateStoryRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(ctx, ["event-suggestion:create"]))(
    Endpoints.Story.Create,
    (
      { body: { body2, actors, groups, media, events, keywords, ...body } },
      r
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
          })
        ),
        TE.chainEitherK(toStoryIO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        }))
      );
    }
  );
};
