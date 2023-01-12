import { Endpoints, AddEndpoint } from "@liexp/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { ProjectEntity } from "@entities/Project.entity";
import { getORMOptions } from "../../utils/orm.utils";
import { RouteContext } from "../route.types";
import { toProjectIO } from "./project.io";

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
          TE.chainEitherK(A.traverse(E.either)(toProjectIO))
        ),
        count: ctx.db.count(ProjectEntity),
      }),
      TE.map(({ data, count }) => ({
        body: {
          data,
          total: count,
        } as any,
        statusCode: 200,
      }))
    );
  });
};
