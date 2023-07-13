import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { MediaEntity } from "@entities/Media.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { deleteFromSpace } from "@flows/media/deleteFromSpace.flow";
import { type RouteContext } from "@routes/route.types";

export const MakeDeleteMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.Delete, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(MediaEntity, { where: { id }, withDeleted: true }),
      TE.chain((m) =>
        sequenceS(TE.ApplicativeSeq)({
          projectImages: pipe(
            ctx.db.find(ProjectImageEntity, {
              where: { image: { id: Equal(id) } },
            }),
            TE.chain((pImages) =>
              pImages.length > 0
                ? ctx.db.softDelete(
                    ProjectImageEntity,
                    pImages.map((p) => p.id),
                  )
                : TE.right(undefined),
            ),
          ),
          space: m.deletedAt ? deleteFromSpace(ctx)(m) : TE.right(undefined),
          media: m.deletedAt
            ? ctx.db.delete(MediaEntity, id)
            : ctx.db.softDelete(MediaEntity, id),
        }),
      ),
      TE.map(() => ({
        body: {
          data: true,
        },
        statusCode: 200,
      })),
    );
  });
};
