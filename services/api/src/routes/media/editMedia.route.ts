import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { RouteContext } from "@routes/route.types";

export const MakeEditMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.Edit, ({ params: { id }, body }) => {
    return pipe(
      ctx.db.findOneOrFail(MediaEntity, { where: { id } }),
      TE.chain((image) =>
        ctx.db.save(MediaEntity, [
          {
            ...image,
            ...body,
            events: body.events.map((e) => ({
              id: e,
            })),
            id,
          },
        ])
      ),
      TE.chain((results) => TE.fromEither(toImageIO(results[0]))),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
