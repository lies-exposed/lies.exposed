import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { toMediaIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { createThumbnail } from "@flows/media/thumbnails/createThumbnail.flow";
import { transferFromExternalProvider } from "@flows/media/transferFromExternalProvider.flow";
import { type RouteContext } from "@routes/route.types";

export const MakeEditMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Media.Edit,
    ({
      params: { id },
      body: {
        overrideThumbnail: _overrideThumbnail,
        transfer: _transfer,
        transferThumbnail: _transferThumbnail,
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

      const transfer = pipe(
        _transfer,
        O.filter((o) => !!o),
      );

      const transferThumbnail = pipe(
        _transferThumbnail,
        O.filter((o) => !!o),
      );

      const extra = pipe(_extra, O.toUndefined);

      return pipe(
        ctx.db.findOneOrFail(MediaEntity, {
          where: { id: Equal(id) },
          loadRelationIds: {
            relations: ["creator"],
          },
        }),
        TE.chain((m) =>
          pipe(
            sequenceS(TE.ApplicativeSeq)({
              thumbnail: O.isSome(overrideThumbnail)
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
              location: O.isSome(transfer)
                ? transferFromExternalProvider(ctx)(
                    m.id,
                    m.location,
                    m.id,
                    m.type,
                  )
                : TE.right(location),
            }),
            ctx.logger.debug.logInTaskEither(`Updates %O`),
            TE.map(({ thumbnail, location }) => ({
              ...m,
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
                : { id: m.creator as any },
              extra,
              thumbnail,
              location,
            })),
          ),
        ),
        TE.chain((image) =>
          ctx.db.save(MediaEntity, [
            {
              ...image,
              id,
            },
          ]),
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
