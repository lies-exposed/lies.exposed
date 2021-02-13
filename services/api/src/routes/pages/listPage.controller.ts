import { endpoints } from "@econnessione/shared";
import { getORMOptions } from "@utils/listQueryToORMOptions";
import { Router } from "express";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import { RouteContext } from "routes/route.types";
import { AddEndpoint } from "ts-endpoint-express";
import { PageEntity } from "../../entities/Page.entity";


export const MakeListPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(endpoints.Page.ListPages, ({ query }) => {
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
