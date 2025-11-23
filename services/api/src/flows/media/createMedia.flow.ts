import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { type UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { MediaPubSub } from "@liexp/backend/lib/pubsub/media/index.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateMedia } from "@liexp/shared/lib/io/http/Media/Media.js";
import { createMediaFromURLFlow } from "./createMediaFromURL.flow.js";
import { type TEReader } from "#flows/flow.types.js";

export const createMediaFlow =
  (body: CreateMedia, user: UserEntity): TEReader<MediaEntity[]> =>
  (ctx) => {
    return pipe(
      fp.TE.Do,
      fp.TE.bind("media", () => createMediaFromURLFlow(body, user)(ctx)),
      fp.TE.chainFirst(({ media }) =>
        MediaPubSub.CreateMediaThumbnailPubSub.publish({
          id: media.id,
          location: media.location,
          type: media.type,
          thumbnail: null,
        })(ctx),
      ),
      fp.TE.chainFirst(({ media }) =>
        MediaPubSub.ExtractMediaExtraPubSub.publish({ id: media.id })(ctx),
      ),
      fp.TE.chain(({ media }) => {
        return ctx.db.save(MediaEntity, [
          {
            ...media,
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
