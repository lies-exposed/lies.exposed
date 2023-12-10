import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints, AddEndpoint } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { getORMOptions } from "../../utils/orm.utils.js";
import { type RouteContext } from "../route.types.js";
import { toProjectIO } from "./project.io.js";
import { ProjectEntity } from "#entities/Project.entity.js";

export const MakeListProjectRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Project.List, ({ query }) => {
    const findOptions = getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE);
    return pipe(
      sequenceS(TE.ApplicativePar)({
        data: pipe(
          ctx.db.find(ProjectEntity, {
            ...findOptions,
            relations: ["media", "areas"],
          }),
          TE.chainEitherK(A.traverse(E.either)(toProjectIO)),
        ),
        count: ctx.db.count(ProjectEntity),
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
