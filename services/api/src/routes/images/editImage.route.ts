import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toImageIO } from "./image.io";
import { ImageEntity } from "@entities/Image.entity";
import { RouteContext } from "@routes/route.types";

export const MakeEditImageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Image.Edit, ({ params: { id }, body }) => {
    return pipe(
      ctx.db.findOneOrFail(ImageEntity, { where: { id } }),
      TE.chain((image) =>
        ctx.db.save(ImageEntity, [{ ...image, ...body, id }])
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
