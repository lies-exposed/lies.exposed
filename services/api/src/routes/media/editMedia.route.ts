import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from "typeorm";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { createThumbnail } from "@helpers/media.helper";
import { RouteContext } from "@routes/route.types";

export const MakeEditMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(
    Endpoints.Media.Edit,
    ({
      params: { id },
      body: { overrideThumbnail: _overrideThumbnail, thumbnail, ...body },
    }) => {
      const overrideThumbnail = pipe(
        _overrideThumbnail,
        O.filter((o) => !!o)
      );

      return pipe(
        ctx.db.findOneOrFail(MediaEntity, { where: { id: Equal(id) } }),
        TE.chain((m) =>
          pipe(
            O.isSome(overrideThumbnail)
              ? createThumbnail(ctx)({
                  ...m,
                  ...body,
                  events: [],
                  links: [],
                  thumbnail: undefined,
                  id,
                })
              : TE.right(O.toNullable(thumbnail)),
            TE.map((thumbnail) => ({
              ...m,
              thumbnail: thumbnail,
            }))
          )
        ),
        TE.chain((image) =>
          ctx.db.save(MediaEntity, [
            {
              ...image,
              ...body,
              links: body.links.map((l) => ({ id: l })),
              events: body.events.map((e) => ({
                id: e,
              })),
              id,
            },
          ])
        ),
        TE.chain((results) =>
          TE.fromEither(
            toImageIO({
              ...results[0],
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
