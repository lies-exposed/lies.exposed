// /* eslint-disable @typescript-eslint/no-var-requires */

import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  contentTypeFromFileExt,
  extensionFromURL,
} from "@liexp/shared/lib/utils/media.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { IsNull, Not } from "typeorm";
import { type CommandFlow } from "./command.type.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { LoggerService } from "#flows/logger/logger.service.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";
import { type TEControllerError } from "#types/TEControllerError.js";

const convertLocationToMediaEntity =
  (ctx: RouteContext) =>
  (
    label: string,
    avatar: string | null,
  ): TEControllerError<MediaEntity | null> => {
    if (!avatar) {
      return fp.TE.right(null);
    }
    return pipe(
      fp.TE.Do,
      fp.TE.bind("media", () =>
        pipe(
          ctx.db.findOne(MediaEntity, { where: { location: avatar } }),
          fp.TE.map(
            fp.O.getOrElse(
              (): MediaEntity => ({
                id: uuid(),
                label: label,
                description: label,
                location: avatar,
                thumbnail: null,
                events: [],
                links: [],
                keywords: [],
                areas: [],
                creator: null,
                extra: null,
                type: contentTypeFromFileExt(extensionFromURL(avatar)),
                stories: [],
                featuredInStories: [],
                featuredInAreas: [],
                deletedAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
              }),
            ),
          ),
        ),
      ),
      fp.TE.bind("thumbnail", ({ media }) =>
        pipe(
          createThumbnail(media)(ctx),
          // if thumbnail fails, we return an empty array
          fp.TE.orElse(() => fp.TE.right<ControllerError, string[]>([])),
        ),
      ),
      fp.TE.map(({ media, thumbnail }) => ({
        ...media,
        thumbnail: thumbnail[0],
      })),
    );
  };

const convertManyMediaTask =
  (ctx: RouteContext) =>
  <A extends (GroupEntity | ActorEntity)[]>(
    save: (a: A) => TEControllerError<A>,
  ) =>
  (locations: A) => {
    return pipe(
      locations,
      fp.A.chunksOf(10),
      fp.A.map(
        flow(
          fp.A.traverse(fp.TE.ApplicativePar)((location) => {
            const label =
              location.username ??
              (location as ActorEntity).fullName ??
              (location as GroupEntity).name;

            return pipe(
              convertLocationToMediaEntity(ctx)(label, location.old_avatar),
              fp.TE.map((media) => [{ ...location, avatar: media }] as A),
              fp.TE.chain(save),
            );
          }),
          fp.TE.map(fp.A.flatten),
        ),
      ),
      fp.A.sequence(fp.TE.ApplicativeSeq),
    );
  };
/**
 * Usage extract-actor-and-group-avatar
 *
 * $search      text used as query for wikipedia search api
 *
 * @returns void
 */
export const extractActorAndGroupAvatar: CommandFlow = async (ctx) => {
  return pipe(
    fp.TE.Do,
    fp.TE.bind("actors", () =>
      pipe(
        ctx.db.find(ActorEntity, {
          where: { avatar: IsNull(), old_avatar: Not(IsNull()) },
        }),
        fp.TE.chain(
          convertManyMediaTask(ctx)((gg) => ctx.db.save(ActorEntity, gg)),
        ),
      ),
    ),
    fp.TE.bind("groups", () =>
      pipe(
        ctx.db.find(GroupEntity, {
          where: { avatar: IsNull(), old_avatar: Not(IsNull()) },
        }),
        fp.TE.chain(
          convertManyMediaTask(ctx)((gg) => ctx.db.save(GroupEntity, gg)),
        ),
      ),
    ),
    fp.TE.map(({ actors, groups }) => {
      return {
        actors: actors.length,
        groups: groups.length,
      };
    }),
    LoggerService.TE.debug(ctx, "extractActorAndGroupAvatar"),
    fp.TE.map(() => undefined),
    throwTE,
  );
};
