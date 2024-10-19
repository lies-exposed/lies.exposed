import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type EditMediaBody } from "@liexp/shared/lib/io/http/Media/index.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils.js";
import * as O from "fp-ts/lib/Option.js";
import * as t from "io-ts";
import { type UUID } from "io-ts-types";
import { Equal } from "typeorm";
import { type ServerContext } from "#context/context.type.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { extractMediaExtra } from "#flows/media/extra/extractMediaExtra.flow.js";
import { saveMedia } from "#flows/media/saveMedia.flow.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import { transferFromExternalProvider } from "#flows/media/transferFromExternalProvider.flow.js";

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
            createThumbnail({
              ...m,
              ...body,
              id,
            }),
            fp.RTE.map((s) => s[0]),
          )
        : O.isSome(transferThumbnail) && m.thumbnail
          ? transferFromExternalProvider(
              m.id,
              m.thumbnail,
              `${m.id}-thumb`,
              m.type,
            )
          : fp.RTE.right(O.toNullable(thumbnail) ?? m.thumbnail),
    ),
    fp.RTE.bind("location", ({ media }) =>
      O.isSome(transfer)
        ? transferFromExternalProvider(
            media.id,
            media.location,
            media.id,
            media.type,
          )
        : fp.RTE.right(location),
    ),
    fp.RTE.bind("extra", ({ media, thumbnail, location }) =>
      O.isSome(overrideExtra)
        ? extractMediaExtra({ ...media, thumbnail, location })
        : fp.RTE.right(extra ?? media.extra),
    ),
    // ctx.logger.debug.logInTaskEither(`Updates %O`),
    fp.RTE.chain(({ thumbnail, location, media, extra }) =>
      pipe(
        saveMedia([
          {
            ...media,
            ...body,
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
            thumbnail,
            location: ensureHTTPS(location),
            id,
          },
        ]),
      ),
    ),
    fp.RTE.map((mm) => mm[0]),
  );
};
