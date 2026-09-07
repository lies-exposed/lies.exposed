import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { validateStoryPublish } from "@liexp/backend/lib/flows/stories/validateStoryPublish.flow.js";
import { StoryIO } from "@liexp/backend/lib/io/story.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { relationsTransformer } from "@liexp/shared/lib/providers/blocknote/transform.utils.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeCreateStoryRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["event-suggestion:create"])(ctx))(
    Endpoints.Story.Create,
    (
      {
        body: {
          body: storyBody,
          actors,
          groups,
          media,
          events,
          keywords,
          ...restBody
        },
      },
      r,
    ) => {
      const featuredImage = pipe(restBody.featuredImage, O.toNullable);
      const relations = relationsTransformer(storyBody);

      return pipe(
        validateStoryPublish(restBody.draft, relations.links)(ctx),
        TE.chain(() =>
          ctx.db.save(StoryEntity, [
            {
              ...removeUndefinedFromPayload(restBody),
              body: storyBody,
              creator: { id: r.user?.id },
              keywords: keywords.map((k) => ({ id: k })),
              actors: actors.map((k) => ({ id: k })),
              groups: groups.map((k) => ({ id: k })),
              media: media.map((m) => ({ id: m })),
              events: events.map((e) => ({ id: e })),
              links: relations.links.map((l) => ({ id: l })),
              featuredImage: featuredImage ? { id: featuredImage } : null,
            },
          ]),
        ),
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
