import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Route } from "../route.types.js";
import { LinkIO } from "./link.io.js";
import { fetchLinks } from "#queries/links/fetchLinks.query.js";
import { RequestDecoder } from "#utils/authenticationHandler.js";

export const MakeListLinksRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Link.List, ({ query }, req) => {
    return pipe(
      RequestDecoder.decodeNullableUser(req, [])(ctx),
      TE.fromIO,
      TE.chain((user) =>
        fetchLinks(query, user ? checkIsAdmin(user.permissions) : false)(ctx),
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
          LinkIO.decodeMany,
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
