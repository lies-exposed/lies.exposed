import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { ExtractMediaExtraPubSub } from "@liexp/backend/lib/pubsub/media/extractMediaExtra.pubSub.js";
import { MediaPubSub } from "@liexp/backend/lib/pubsub/media/index.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type EditMediaBody } from "@liexp/shared/lib/io/http/Media/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as t from "io-ts";
import { type UUID } from "io-ts-types";
import { Equal } from "typeorm";
import { type ServerContext } from "#context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";

export const editMedia = (
  id: UUID,
  {
    restore: _restore,
    overrideThumbnail: _overrideThumbnail,
    transfer: _transfer,
    transferThumbnail: _transferThumbnail,
    overrideExtra: _overrideExtra,
    description: _description,
    thumbnail,
    location,
    creator,
    extra: _extra,
    ...body
  }: EditMediaBody,
): TEReader<MediaEntity> => {
  const overrideThumbnail = pipe(
    _overrideThumbnail,
    O.filter((o) => !!o),
  );
  const overrideExtra = pipe(_overrideExtra, O.filter(t.boolean.is));

  const transfer = pipe(
    _transfer,
    O.filter((o): o is true => !!o),
  );

  const transferThumbnail = pipe(
    _transferThumbnail,
    O.filter((o): o is true => !!o),
  );

  const description = pipe(_description, O.toNullable);

  const restore = pipe(
    _restore,
    O.filter((o): o is true => !!o),
    O.isSome,
  );
  const extra = pipe(_extra, O.toUndefined);
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("media", () =>
      pipe(
        fp.RTE.ask<ServerContext>(),
        fp.RTE.chainTaskEitherK((ctx) =>
          ctx.db.findOneOrFail(MediaEntity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["creator"],
            },
            withDeleted: restore,
          }),
        ),
      ),
    ),
    fp.RTE.bind("thumbnail", ({ media: m }) =>
      O.isSome(overrideThumbnail)
        ? pipe(
            pipe(
              MediaPubSub.CreateMediaThumbnailPubSub.publish({
                ...m,
                type: body.type,
                thumbnail: undefined,
                id,
              }),
              fp.RTE.map(() => null),
            ),
          )
        : O.isSome(transferThumbnail) && m.thumbnail
          ? pipe(
              MediaPubSub.TransferMediaFromExternalProviderPubSub.publish({
                mediaId: m.id,
                url: m.thumbnail,
                fileName: `${m.id}-thumb`,
                mimeType: m.type,
              }),
              fp.RTE.map(() => m.thumbnail),
            )
          : fp.RTE.right(fp.O.getOrElse(() => m.thumbnail)(thumbnail)),
    ),
    fp.RTE.bind("location", ({ media }) =>
      O.isSome(transfer)
        ? pipe(
            MediaPubSub.TransferMediaFromExternalProviderPubSub.publish({
              mediaId: media.id,
              url: media.location,
              fileName: media.id,
              mimeType: media.type,
            }),
            fp.RTE.map(() => location),
          )
        : fp.RTE.right(location),
    ),
    fp.RTE.chain(({ media, location, thumbnail }) =>
      pipe(
        MediaRepository.save<ServerContext>([
          {
            ...media,
            ...body,
            location,
            thumbnail,
            keywords: body.keywords.map((id) => ({ id })),
            links: body.links.map((id) => ({ id })),
            events: body.events.map((id) => ({
              id,
            })),
            areas: body.areas.map((id) => ({
              id,
            })),
            creator: O.isSome(creator)
              ? { id: creator.value }
              : { id: media.creator as any },
            deletedAt: restore ? null : media.deletedAt,
            description,
            extra,
            id,
          },
        ]),
      ),
    ),
    fp.RTE.map((mm) => mm[0]),
    fp.RTE.chainFirst(({ id }) =>
      O.isSome(overrideExtra)
        ? ExtractMediaExtraPubSub.publish({ id })
        : fp.RTE.right(0),
    ),
  );
};
