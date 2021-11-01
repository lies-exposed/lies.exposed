import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { ImageEntity } from "@entities/Image.entity";
import { RouteContext } from "@routes/route.types";

export const MakeDeleteImageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Image.Delete, ({ params: { id } }) => {
    return pipe(
      ctx.db.delete(ImageEntity, id),
      TE.map((result) => ({
        body: {
          data: result.affected === 1,
        },
        statusCode: 200,
      }))
    );
  });
};
