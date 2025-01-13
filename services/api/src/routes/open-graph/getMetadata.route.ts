import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { extractRelationsFromURL } from "@liexp/backend/lib/flows/admin/nlp/extractRelationsFromURL.flow.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Link } from "@liexp/shared/lib/io/http/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import {
  type ControllerError,
  toControllerError,
} from "#io/ControllerError.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeGetMetadataRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.OpenGraph.Custom.GetMetadata,
    ({ query: { url } }) => {
      return pipe(
        ctx.db.findOne(LinkEntity, {
          where: {
            url: Equal(url),
          },
        }),
        TE.chain((link) => {
          const linkAndMetadata = sequenceS(TE.ApplicativePar)({
            metadata: O.isSome(link)
              ? TE.right<ControllerError, Metadata>({
                  date: link.value.publishDate?.toISOString() ?? undefined,
                  title: link.value.title,
                  description: link.value.description ?? link.value.title,
                  keywords: link.value.keywords?.map((id) => id.id) ?? [],
                  icon: "",
                  image: link.value.image?.location ?? null,
                  provider: link.value.provider ?? "",
                  type: "article",
                  url: link.value.url,
                })
              : ctx.urlMetadata.fetchMetadata(url, {}, toControllerError),
            link: pipe(
              link,
              O.map(LinkIO.decodeSingle),
              O.map(TE.fromEither),
              O.getOrElse(() =>
                TE.right<ControllerError, Link.Link | undefined>(undefined),
              ),
            ),
            relations: pipe(
              link,
              O.map((l) => l.url),
              O.getOrElse(() => url),
              (url) =>
                ctx.puppeteer.execute({}, (_, p) =>
                  extractRelationsFromURL(p, url)(ctx),
                ),
            ),
          });

          return linkAndMetadata;
        }),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 200,
        })),
      );
    },
  );
};
