import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { fetchGroups } from "../../queries/groups/fetchGroups.query.js";
import { type RouteContext } from "../route.types.js";
import { toGroupIO } from "./group.io.js";

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
