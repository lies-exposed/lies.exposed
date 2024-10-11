import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as TE from "fp-ts/lib/TaskEither.js";
import { MediaIO } from "./media.io.js";
import { editMedia } from "#flows/media/editMedia.flow.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeEditMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.Edit, ({ params: { id }, body }) => {
    return pipe(
      editMedia(id, body)(ctx),
      TE.chain((media) =>
        TE.fromEither(
          MediaIO.decodeSingle(
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
  });
};
