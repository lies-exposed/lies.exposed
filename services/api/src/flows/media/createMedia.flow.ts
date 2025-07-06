import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { type UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { MediaPubSub } from "@liexp/backend/lib/pubsub/media/index.js";
import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { parseURL } from "@liexp/shared/lib/helpers/media.helper.js";
import { type CreateMedia } from "@liexp/shared/lib/io/http/Media/Media.js";
import { type TEReader } from "#flows/flow.types.js";

export const createMediaFlow =
  (body: CreateMedia, user: UserEntity): TEReader<MediaEntity[]> =>
  (ctx) => {
    return pipe(
      fp.TE.Do,
      fp.TE.bind("location", () => {
        return pipe(
          parseURL(body.location),
          fp.E.fold(
            () => body.location,
            (r) => r.location,
          ),
          fp.TE.right,
        );
      }),
      fp.TE.bind("media", ({ location }) =>
        ctx.db.save(MediaEntity, [
          {
            ...body,
            location,
            label: body.label ?? null,
            description: body.description ?? body.label ?? null,
            creator: user,
            extra: body.extra ?? null,
            areas: body.areas.map((id) => ({ id })),
            keywords: body.keywords.map((id) => ({ id })),
            links: body.links.map((id) => ({ id })),
            events: body.events.map((e) => ({
              id: e,
            })),
          },
        ]),
      ),
      fp.TE.chainFirst(({ media }) =>
        MediaPubSub.CreateMediaThumbnailPubSub.publish({
          id: media[0].id,
          location: media[0].location,
          type: media[0].type,
          thumbnail: null,
        })(ctx),
      ),
      fp.TE.chainFirst(({ media }) =>
        MediaPubSub.ExtractMediaExtraPubSub.publish({ id: media[0].id })(ctx),
      ),
      fp.TE.chain(({ media }) => {
        return ctx.db.save(MediaEntity, [
          {
            ...media[0],
            thumbnail: null,
            extra: {
              thumbnails: [],
              needRegenerateThumbnail: false,
            },
          },
        ]);
      }),
    );
  };
