import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { Equal } from "typeorm";
import { LinkEntity } from "#entities/Link.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { ProjectImageEntity } from "#entities/ProjectImage.entity.js";
import { deleteFromSpace } from "#flows/media/deleteFromSpace.flow.js";
import { type RouteContext } from "#routes/route.types.js";

export const MakeDeleteMediaRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Media.Delete, ({ params: { id } }) => {
    return pipe(
      ctx.db.findOneOrFail(MediaEntity, {
        where: { id },
        relations: ["links"],
        withDeleted: true,
      }),
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
          links:
            m.deletedAt && m.links.length > 0
              ? ctx.db.delete(
                  LinkEntity,
                  m.links.map((l) => l.id),
                )
              : TE.right(undefined),
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
