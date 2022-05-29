import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sanitizeURL } from "@liexp/shared/utils/url.utils";
import { Router } from "express";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { toLinkIO } from "./link.io";
import { LinkEntity } from "@entities/Link.entity";
import { ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const MakeCreateLinkRoute = (r: Router, ctx: RouteContext): void => {
  AddEndpoint(r)(Endpoints.Link.Create, ({ body }) => {
    const data = {
      events: body.events.map((e) => ({ id: e })),
    };
    return pipe(
      ctx.urlMetadata.fetchMetadata(body.url, {}, (e) => ServerError()),
      TE.chain((meta) =>
        ctx.db.save(LinkEntity, [
          {
            ...meta,
            ...data,
            title: meta.title,
            image: meta.image
              ? {
                  description: meta.description,
                  thumbnail: meta.image,
                  location: meta.image,
                  type: "image/jpeg",
                }
              : null,
            url: sanitizeURL(body.url),
            publishDate: meta.date,
            keywords: [],
          },
        ])
      ),
      TE.chainEitherK(A.traverse(E.Applicative)(toLinkIO)),
      TE.map(([data]) => ({
        body: { data },
        statusCode: 200,
      }))
    );
  });
};
