import { ProjectImageEntity } from "@liexp/backend/lib/entities/ProjectImage.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toProjectImageIO } from "./ProjectImage.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeListProjectImageRoute: Route = (r, ctx): void => {
  AddEndpoint(r)(Endpoints.ProjectImage.List, () => {
    return pipe(
      sequenceS(TE.ApplicativeSeq)({
        data: pipe(
          ctx.db.find(ProjectImageEntity, {
            relations: ["image", "project"],
          }),
          TE.chainEitherK(A.traverse(E.Applicative)(toProjectImageIO)),
        ),
        count: ctx.db.count(ProjectImageEntity),
      }),
      TE.map(({ data, count }) => ({
        body: {
          data,
          total: count,
        } as any,
        statusCode: 200,
      })),
    );
  });
};
