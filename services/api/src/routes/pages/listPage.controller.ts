import { Endpoints, AddEndpoint } from "@econnessione/shared/endpoints";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { PageEntity } from "../../entities/Page.entity";
import { RouteContext } from "../route.types";
import { getORMOptions } from "@utils/orm.utils";

export const MakeListPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Page.List, ({ query }) => {
    return pipe(
      sequenceS(TE.taskEither)({
        data: ctx.db.find(PageEntity, {
          ...getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE),
          loadRelationIds: true,
        }),
        total: ctx.db.count(PageEntity),
      }),
      TE.map(({ data, total }) => ({
        body: {
          data: data.map((page) => ({
            ...page,
            type: "PageFrontmatter" as const,
          })),
          total,
        },
        statusCode: 200,
      }))
    );
  });
};
