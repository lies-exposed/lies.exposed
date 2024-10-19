import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fetchGroups } from "../../queries/groups/fetchGroups.query.js";
import { type Route } from "../route.types.js";
import { GroupIO } from "./group.io.js";

export const MakeListGroupRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Group.List, ({ query }) => {
    return pipe(
      pipe(
        fetchGroups(query)(ctx),
        fp.TE.chainEitherK(([results, total]) =>
          pipe(
            GroupIO.decodeMany(
              results.map((g) => ({
                ...g,
                members: g.members.map((d) => d.id) as any,
              })),
              ctx.env.SPACE_ENDPOINT,
            ),
            E.map((data) => ({ total, data })),
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
