import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { fetchActors } from "../../queries/actors/fetchActors.query.js";
import { type RouteContext } from "../route.types.js";
import { toActorIO } from "./actor.io.js";

export const MakeListPageRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Actor.List, ({ query }) => {
    return pipe(
      fetchActors(ctx)(query),
      TE.chain(({ results, total }) =>
        pipe(
          results,
          A.traverse(E.Applicative)(toActorIO),
          TE.fromEither,
          TE.map((results) => ({
            total,
            data: results,
          })),
        ),
      ),
      TE.map(({ data, total }) => ({
        body: {
          data,
          total,
        },
        statusCode: 200,
      })),
    );
  });
};
