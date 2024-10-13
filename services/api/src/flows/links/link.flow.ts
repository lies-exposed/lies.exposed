import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import { type TEReader } from "../flow.types.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { findOneByLocationOrElse } from "#flows/media/findOneByLocationOrElse.flow.js";
import { ServerError, type ControllerError } from "#io/ControllerError.js";

export const fetchAsLink =
  (
    creator: UserEntity,
    url: URL,
    defaults: Partial<Metadata> | undefined,
  ): TEReader<LinkEntity> =>
  (ctx) => {
    return pipe(
      ctx.urlMetadata.fetchMetadata(url, {}, (e) =>
        ServerError([`Error fetching metadata from url ${url}`]),
      ),
      TE.orElse((e) =>
        TE.right<ControllerError, Partial<Metadata>>({
          keywords: [],
          url: url as string,
        }),
      ),
      TE.map((m) => ({
        ...m,
        title: defaults?.title ?? m.title ?? url,
        description: defaults?.description ?? m.description ?? url,
        image: defaults?.image ?? m.image ?? null,
      })),
      TE.chain((m) =>
        pipe(
          findOneByLocationOrElse(
            m,
            (image) => ({
              id: uuid(),
              label: defaults?.title ?? m.description ?? m.url,
              thumbnail: image,
              location: image,
              description: defaults?.title ?? m.description ?? m.url,
              type: ImageType.types[0].value,
            }),
            creator,
          )(ctx),
          TE.map((media) => ({
            ...m,
            image: fp.O.toNullable(media),
          })),
        ),
      ),
      TE.map((meta): LinkEntity => {
        ctx.logger.debug.log("Creating link %O", meta);
        const publishDate = pipe(
          DateFromISOString.decode(meta.date),
          E.getOrElse((): Date | null => null),
        );

        return {
          id: uuid(),
          title: meta.title,
          url,
          description: meta.description ?? meta.title,
          publishDate,
          image: meta.image,
          createdAt: new Date(),
          updatedAt: new Date(),
          creator: null,
          events: [],
          provider: null,
          keywords: [],
          deletedAt: null,
        };
      }),
    );
  };

/**
 * Fetch open graph metadata from the given url and creates a LinkEntity.
 */
export const fetchAndSave =
  (u: UserEntity, url: URL): TEReader<LinkEntity> =>
  (ctx) => {
    ctx.logger.debug.log("Searching link with url %s", url);
    const sanitizedURL = sanitizeURL(url);
    return pipe(
      ctx.db.findOne(LinkEntity, { where: { url: Equal(sanitizedURL) } }),
      TE.chain((optLink) => {
        if (O.isSome(optLink)) {
          ctx.logger.debug.log("Link found! %s", optLink.value.id);
          return TE.right(optLink.value);
        }

        ctx.logger.debug.log("Link not found, fetching...");
        return pipe(
          fetchAsLink(u, sanitizedURL, undefined)(ctx),
          TE.chain((l) => ctx.db.save(LinkEntity, [l])),
          TE.map((ll) => ll[0]),
        );
      }),
    );
  };
