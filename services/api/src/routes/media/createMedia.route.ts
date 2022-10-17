import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toImageIO } from "./media.io";
import { MediaEntity } from "@entities/Media.entity";
import { RouteContext } from "@routes/route.types";


export const MakeCreateMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.Create, ({ body }) => {
    return pipe(
      ctx.db.save(MediaEntity, [
        {
          ...body,
          events: body.events.map((e) => ({
            id: e,
          })),
        },
      ]),
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
