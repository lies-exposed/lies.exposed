import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { MP4Type } from "@liexp/shared/lib/io/http/Media";
import { type Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toMediaIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { extractMP4Extra } from "@flows/media/extra/extractMP4Extra";
import { createThumbnail } from "@flows/media/thumbnails/createThumbnail.flow";
import { type RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { ensureUserExists } from "@utils/user.utils";

export const MakeCreateMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, []))(
    Endpoints.Media.Create,
    ({ body }, req) => {
      return pipe(
        ensureUserExists(req.user),
        TE.fromEither,
        TE.chain((u) =>
          pipe(
            TE.Do,
            TE.bind("media", () =>
              ctx.db.save(MediaEntity, [
                {
                  ...body,
                  creator: u.id as any,
                  extra: body.extra ?? null,
                  areas: body.areas.map((id) => ({ id })),
                  keywords: body.keywords.map((id) => ({ id })),
                  events: body.events.map((e) => ({
                    id: e,
                  })),
                },
              ]),
            ),
            TE.bind("thumbnail", ({ media }) => createThumbnail(ctx)(media[0])),
            TE.bind("extra", ({ media }) =>
              media[0].type === MP4Type.value
                ? extractMP4Extra(ctx)({ ...media[0], type: MP4Type.value })
                : TE.right(undefined),
            ),
            TE.chain(({ media, thumbnail, extra }) => {
              return ctx.db.save(MediaEntity, [
                {
                  ...media[0],
                  thumbnail: thumbnail[0],
                  extra,
                },
              ]);
            }),
          ),
        ),
        TE.chainEitherK((media) => toMediaIO(media[0], ctx.env.SPACE_ENDPOINT)),
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
