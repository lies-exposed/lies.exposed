import { AddEndpoint, Endpoints } from "@econnessione/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { ImageEntity } from "@entities/Image.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { RouteContext } from "@routes/route.types";

export const MakeDeleteImageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Image.Delete, ({ params: { id } }) => {
    return pipe(
      sequenceS(TE.ApplicativeSeq)({
        projectImages: pipe(
          ctx.db.find(ProjectImageEntity, { where: { image: { id } } }),
          TE.chain((pImages) =>
            pImages.length > 0
              ? ctx.db.softDelete(
                  ProjectImageEntity,
                  pImages.map((p) => p.id)
                )
              : TE.right(undefined)
          )
        ),
        images: ctx.db.softDelete(ImageEntity, id),
      }),
      TE.map(() => ({
        body: {
          data: true,
        },
        statusCode: 200,
      }))
    );
  });
};
