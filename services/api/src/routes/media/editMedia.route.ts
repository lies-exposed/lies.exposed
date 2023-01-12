import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { MediaEntity } from "@entities/Media.entity";
import { createThumbnail } from "@flows/media/createThumbnail.flow";
import { RouteContext } from "@routes/route.types";
import { toImageIO } from "./media.io";

export const MakeEditMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Media.Edit,
    ({
      params: { id },
      body: {
        overrideThumbnail: _overrideThumbnail,
        thumbnail,
        creator,
        ...body
      },
    }) => {
      const overrideThumbnail = pipe(
        _overrideThumbnail,
        O.filter((o) => !!o)
      );

      return pipe(
        ctx.db.findOneOrFail(MediaEntity, {
          where: { id: Equal(id) },
          loadRelationIds: {
            relations: ["creator"],
          },
        }),
        TE.chain((m) =>
          pipe(
            O.isSome(overrideThumbnail)
              ? createThumbnail(ctx)({
                  ...m,
                  ...body,
                  id,
                })
              : TE.right(O.toNullable(thumbnail)),
            TE.map((thumbnail) => ({
              ...m,
              creator: O.isSome(creator)
                ? { id: creator.value }
                : { id: m.creator as any },
              thumbnail,
            }))
          )
        ),
        TE.chain((image) =>
          ctx.db.save(MediaEntity, [
            {
              ...image,
              ...body,
              keywords: body.keywords.map((id) => ({ id })),
              links: body.links.map((id) => ({ id })),
              events: body.events.map((id) => ({
                id,
              })),
              id,
            },
          ])
        ),
        TE.chain((results) =>
          TE.fromEither(
            toImageIO({
              ...results[0],
              creator: results[0].creator?.id as any,
              keywords: results[0].keywords.map((k) => k.id) as any[],
              links: results[0].links.map((l) => l.id) as any[],
              events: results[0].events.map((e) => e.id) as any[],
            })
          )
        ),
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
