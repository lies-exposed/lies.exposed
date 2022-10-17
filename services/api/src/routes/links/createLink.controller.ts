import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { parseISO } from "@liexp/shared/utils/date";
import { sanitizeURL } from "@liexp/shared/utils/url.utils";
import { Router } from "express";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";

export const MakeCreateLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r, authenticationHandler(ctx, []))(
    Endpoints.Link.Create,
    ({ body }, req) => {
      // const data = {
      //   events: body.events.map((e) => ({ id: e })),
      // };
      const id = (req.user as any).id;
      return pipe(
        ctx.urlMetadata.fetchMetadata(body.url, {}, (e) => ServerError()),
        TE.chain((m) =>
          ctx.db.save(LinkEntity, [
            {
              ...m,
              events: [],
              title: m.title,
              image: m.image
                ? {
                    description: m.description,
                    thumbnail: m.image,
                    location: m.image,
                    type: "image/jpeg" as const,
                  }
                : null,
              url: sanitizeURL(m.url as any),
              publishDate: m.date ? parseISO(m.date) : undefined,
              keywords: [],
              creator: { id },
            },
          ])
        ),
        TE.chainEitherK(A.traverse(E.Applicative)(toLinkIO)),
        TE.map(([data]) => ({
          body: { data },
          statusCode: 200,
        }))
      );
    }
  );
};
