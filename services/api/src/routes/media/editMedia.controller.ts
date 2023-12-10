import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { MP4Type } from "@liexp/shared/lib/io/http/Media.js";
import { ensureHTTPS } from "@liexp/shared/lib/utils/media.utils.js";
import { type Router } from "express";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts";
import { Equal } from "typeorm";
import { toMediaIO } from "./media.io.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { extractMP4Extra } from "#flows/media/extra/extractMP4Extra.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import { transferFromExternalProvider } from "#flows/media/transferFromExternalProvider.flow.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeEditMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Media.Edit,
    ({
      params: { id },
      body: {
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
      },
    }) => {
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
        TE.Do,
        TE.bind("media", () =>
          ctx.db.findOneOrFail(MediaEntity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["creator"],
            },
            withDeleted: restore,
          }),
        ),
        TE.bind("thumbnail", ({ media: m }) =>
          O.isSome(overrideThumbnail)
            ? pipe(
                createThumbnail(ctx)({
                  ...m,
                  ...body,
                  id,
                }),
                TE.map((s) => s[0]),
              )
            : O.isSome(transferThumbnail) && m.thumbnail
              ? transferFromExternalProvider(ctx)(
                  m.id,
                  m.thumbnail,
                  `${m.id}-thumb`,
                  m.type,
                )
              : TE.right(O.toNullable(thumbnail)),
        ),
        TE.bind("location", ({ media }) =>
          O.isSome(transfer)
            ? transferFromExternalProvider(ctx)(
                media.id,
                media.location,
                media.id,
                media.type,
              )
            : TE.right(location),
        ),
        TE.bind("extra", ({ media }) =>
          O.isSome(overrideExtra) && media.type === MP4Type.value
            ? extractMP4Extra(ctx)({ ...media, type: MP4Type.value })
            : TE.right(
                extra
                  ? {
                      ...media.extra,
                      ...extra,
                      duration: extra.duration
                        ? Math.floor(extra.duration)
                        : media.extra?.duration,
                    }
                  : null,
              ),
        ),
        ctx.logger.debug.logInTaskEither(`Updates %O`),
        TE.chain(({ thumbnail, location, media, extra }) =>
          pipe(
            ctx.db.save(MediaEntity, [
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
        TE.chain(([media]) =>
          TE.fromEither(
            toMediaIO(
              {
                ...media,
                creator: media.creator?.id as any,
                keywords: media.keywords.map((k) => k.id) as any[],
                links: media.links.map((l) => l.id) as any[],
                events: media.events.map((e) => e.id) as any[],
                areas: media.areas.map((e) => e.id) as any[],
              },
              ctx.env.SPACE_ENDPOINT,
            ),
          ),
        ),
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
