import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { parseURL } from "@liexp/shared/lib/helpers/media.helper.js";
import { type CreateMedia } from "@liexp/shared/lib/io/http/Media/Media.js";
import { type User } from "@liexp/shared/lib/io/http/index.js";
import { ExtractMediaExtraPubSub } from "../../subscribers/media/extractMediaExtra.subscriber.js";
import { createThumbnail } from "./thumbnails/createThumbnail.flow.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";

export const createMediaFlow =
  (body: CreateMedia, user: User.User): TEReader<MediaEntity[]> =>
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
            creator: user.id as any,
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
      fp.TE.bind("thumbnails", ({ media }) => createThumbnail(media[0])(ctx)),
      fp.TE.chainFirst(({ media }) =>
        ExtractMediaExtraPubSub.publish(media[0])(ctx),
      ),
      fp.TE.chain(({ media, thumbnails }) => {
        return ctx.db.save(MediaEntity, [
          {
            ...media[0],
            thumbnail: thumbnails[0],
            extra: {
              thumbnails,
              needRegenerateThumbnail: false,
            },
          },
        ]);
      }),
    );
  };
