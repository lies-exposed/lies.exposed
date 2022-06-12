import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { Equal } from 'typeorm';
import { MediaEntity } from "@entities/Media.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { RouteContext } from "@routes/route.types";

export const MakeDeleteMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.Delete, ({ params: { id } }) => {
    return pipe(
      sequenceS(TE.ApplicativeSeq)({
        projectImages: pipe(
          ctx.db.find(ProjectImageEntity, { where: { image: { id: Equal(id) } } }),
          TE.chain((pImages) =>
            pImages.length > 0
              ? ctx.db.softDelete(
                  ProjectImageEntity,
                  pImages.map((p) => p.id)
                )
              : TE.right(undefined)
          )
        ),
        media: ctx.db.softDelete(MediaEntity, id),
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
