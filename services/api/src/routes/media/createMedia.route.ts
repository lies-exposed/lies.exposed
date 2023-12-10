import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { MP4Type } from "@liexp/shared/lib/io/http/Media.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toMediaIO } from "./media.io.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { extractMP4Extra } from "#flows/media/extra/extractMP4Extra.js";
import { createThumbnail } from "#flows/media/thumbnails/createThumbnail.flow.js";
import { type RouteContext } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

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
                  label: body.label ?? null,
                  description: body.description ?? null,
                  creator: u.id as any,
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
