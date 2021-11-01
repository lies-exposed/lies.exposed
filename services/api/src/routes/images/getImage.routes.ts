import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toImageIO } from "./image.io";
import { ImageEntity } from "@entities/Image.entity";
import { RouteContext } from "@routes/route.types";

export const MakeGetImageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Image.Get, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(ImageEntity, { where: { id } }),
      TE.chain((result) => TE.fromEither(toImageIO(result))),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 200,
      }))
    );
  });
};
