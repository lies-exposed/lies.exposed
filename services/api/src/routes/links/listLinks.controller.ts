import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import { type Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { type RouteContext } from "../route.types.js";
import { toLinkIO } from "./link.io.js";
import { fetchLinks } from "#queries/links/fetchLinks.query.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeListLinksRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Link.List, ({ query }, req) => {
    return pipe(
      RequestDecoder.decodeNullableUser(ctx)(req, []),
      TE.fromIO,
      TE.chain((user) =>
        fetchLinks(ctx)(query, user ? checkIsAdmin(user.permissions) : false),
      ),
      TE.chainEitherK(([results, total]) =>
        pipe(
          results.map((r) => ({
            ...r,
            creator: (r.creator?.id as any) ?? null,
            events: r.events.map((e) => e.id) as any[],
            keywords: r.keywords.map((e) => e.id) as any[],
            socialPosts: r.socialPosts ?? [],
          })),
          A.traverse(E.Applicative)(toLinkIO),
          E.map((data) => ({ data, total })),
        ),
      ),
      TE.map((body) => ({
        body,
        statusCode: 200,
      })),
    );
  });
};
