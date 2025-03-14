import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/index.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { Schema } from "effect";
import { type ParseError } from "effect/ParseResult";
import * as E from "fp-ts/lib/Either.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { type LinkEntity } from "../../entities/Link.entity.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { ServerError } from "../../errors/ServerError.js";
import { LinkRepository } from "../../services/entity-repository.service.js";
import { LoggerService } from "../../services/logger/logger.service.js";
import { findOneByLocationOrElse } from "../media/findOneByLocationOrElse.flow.js";

export const fromURL =
  <C extends URLMetadataContext & LoggerContext & DatabaseContext>(
    creator: UserEntity,
    url: URL,
    defaults: Partial<Metadata> | undefined,
  ) =>
  (
    ctx: C,
  ): TE.TaskEither<
    APIError | ServerError,
    LinkEntity & { image: MediaEntity | null }
  > => {
    const urll = sanitizeURL(url);
    return pipe(
      ctx.urlMetadata.fetchMetadata(urll, {}, (e) =>
        ServerError.of([`Error fetching metadata from url ${urll}`]),
      ),
      TE.orElse((e) =>
        TE.right<ServerError, Partial<Metadata>>({
          keywords: [],
          url: url as string,
        }),
      ),
      TE.map((m) => ({
        ...m,
        url: urll,
        title: defaults?.title ?? m.title ?? urll,
        description: defaults?.description ?? m.description ?? urll,
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
              type: ImageType.members[0].Encoded,
              creator,
            }),
            creator,
          )(ctx),
          TE.map((media) => ({
            ...m,
            image: fp.O.toNullable(media),
          })),
        ),
      ),
      TE.map((link): LinkEntity & { image: MediaEntity | null } => {
        ctx.logger.debug.log("Creating link %O", link);
        const publishDate = pipe(
          link.date,
          (d) =>
            d
              ? Schema.decodeEither(Schema.DateFromString)(d)
              : E.right<ParseError, Date | null>(null),
          E.getOrElse((): Date | null => null),
        );

        return {
          id: uuid(),
          title: link.title,
          url: urll,
          description: link.description ?? link.title,
          publishDate,
          image: link.image
            ? {
                ...link.image,
                label: link.image.label ?? link.title,
                description: link.image.description ?? link.title,
                thumbnail: link.image.thumbnail ?? null,
                creator: null,
                extra: link.image.extra ?? null,
                deletedAt: null,
                socialPosts: [],
                events: [],
                links: [],
                areas: [],
                keywords: [],
                featuredInAreas: [],
                featuredInStories: [],
                stories: [],
              }
            : null,
          createdAt: new Date(),
          updatedAt: new Date(),
          creator: creator,
          provider: null,
          events: [],
          keywords: [],
          socialPosts: [],
          deletedAt: null,
        };
      }),
    );
  };

/**
 * Fetch open graph metadata from the given url and creates a LinkEntity.
 */
export const fetchAndSave = <
  C extends URLMetadataContext & LoggerContext & DatabaseContext,
>(
  u: UserEntity,
  url: URL,
): ReaderTaskEither<C, ServerError, LinkEntity> => {
  return pipe(
    fp.RTE.right(sanitizeURL(url)),
    LoggerService.RTE.debug(["Searching link with url %s", url]),
    fp.RTE.chain((sanitizedURL) =>
      LinkRepository.findOne<C>({
        where: { url: Equal(sanitizedURL) },
      }),
    ),
    fp.RTE.chain((optLink) => (ctx) => {
      if (fp.O.isSome(optLink)) {
        ctx.logger.debug.log("Link found! %s", optLink.value.id);
        return fp.TE.right(optLink.value);
      }

      ctx.logger.debug.log("Link not found, fetching...");
      return pipe(
        fromURL(u, url, undefined)(ctx),
        fp.TE.mapLeft(ServerError.fromUnknown),
        fp.TE.chain((l) => LinkRepository.save([l])(ctx)),
        fp.TE.map((ll) => ll[0]),
      );
    }),
  );
};
