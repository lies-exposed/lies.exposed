import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import { sequenceS } from "fp-ts/Apply";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type RouteContext } from "../route.types";
import { SocialPostEntity } from '@entities/SocialPost.entity';
import { getORMOptions } from "@utils/orm.utils";

export const MakeListSocialPostRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.SocialPosts.List, ({ query }) => {
    return pipe(
      sequenceS(TE.ApplicativePar)({
        data: ctx.db.find(SocialPostEntity, {
          ...getORMOptions(query, ctx.env.DEFAULT_PAGE_SIZE),
          // loadRelationIds: true,
        }),
        total: ctx.db.count(SocialPostEntity),
      }),
      // TE.chain(({ data, total }) =>
      //   pipe(
      //     data,
      //     A.map(toPageIO),
      //     A.sequence(E.Applicative),
      //     TE.fromEither,
      //     TE.map((data) => ({ total, data }))
      //   )
      // ),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      }))
    );
  });
};
