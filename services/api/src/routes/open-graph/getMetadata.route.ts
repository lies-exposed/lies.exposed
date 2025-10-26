import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { readExtractedEntities } from "@liexp/backend/lib/flows/admin/nlp/extractEntitiesFromAny.flow.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
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
        TE.Do,
        TE.apS(
          "link",
          ctx.db.findOne<LinkEntity & { image: MediaEntity }>(LinkEntity, {
            where: {
              url: Equal(url),
            },
            relations: ["image"],
          }),
        ),
        TE.bind("metadata", ({ link }) => {
          if (O.isSome(link)) {
            return TE.right<ControllerError, Metadata>({
              date: link.value.publishDate?.toISOString() ?? undefined,
              title: link.value.title,
              description: link.value.description ?? link.value.title,
              keywords: link.value.keywords?.map((id) => id.id) ?? [],
              icon: "",
              image: link.value.image?.location ?? null,
              provider: link.value.provider ?? "",
              type: "article",
              url: link.value.url,
            });
          }
          return ctx.urlMetadata.fetchMetadata(url, {}, toControllerError);
        }),
        TE.bind("relations", ({ link }) => {
          if (O.isNone(link)) {
            return TE.right(null);
          }

          return pipe(readExtractedEntities({ url: link.value.url })(ctx));
        }),
        TE.chain(({ link, metadata, relations }) => {
          return sequenceS(TE.ApplicativePar)({
            link: pipe(
              link,
              O.map((l) => LinkIO.decodeSingle(l)),
              O.map(TE.fromEither),
              O.getOrElse(() =>
                TE.right<ControllerError, Link.Link | undefined>(undefined),
              ),
            ),
            metadata: TE.right(metadata),
            relations: TE.right(relations),
          });
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
