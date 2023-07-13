import { fp } from "@liexp/core/lib/fp";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { type Router } from "express";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { fetchGroups } from "../../queries/groups/fetchGroups.query";
import { type RouteContext } from "../route.types";
import { toGroupIO } from "./group.io";

export const MakeListGroupRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Group.List, ({ query }) => {
    return pipe(
      pipe(
        fetchGroups(ctx)(query),
        fp.TE.chain(([results, total]) =>
          pipe(
            results,
            fp.A.traverse(E.Applicative)((g) =>
              toGroupIO({
                ...g,
                members: g.members.map((d) => d.id) as any,
              }),
            ),
            TE.fromEither,
            TE.map((data) => ({ total, data })),
          ),
        ),
      ),
      TE.map((body) => ({
        body,
        statusCode: 200,
      })),
    );
  });
};
