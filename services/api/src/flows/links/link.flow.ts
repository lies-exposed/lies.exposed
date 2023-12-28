import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { uuid } from "@liexp/shared/lib/utils/uuid.js";
import * as E from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import { type TEFlow } from "../flow.types.js";
import { LinkEntity } from "#entities/Link.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { ServerError, type ControllerError } from "#io/ControllerError.js";

export const fetchAsLink: TEFlow<
  [UserEntity, URL, Partial<Metadata> | undefined],
  LinkEntity
> =
  (ctx) =>
  (creator, url, defaults): TE.TaskEither<ControllerError, LinkEntity> => {
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
          m.image,
          fp.O.fromNullable,
          fp.O.map((image) =>
            pipe(
              ctx.db.findOne(MediaEntity, { where: { location: image } }),
              TE.map((mOpt) =>
                pipe(
                  mOpt,
                  O.alt(() =>
                    O.some<MediaEntity>({
                      id: uuid() as any,
                      label: defaults?.title ?? m.description ?? m.url,
                      thumbnail: image,
                      location: image,
                      description: defaults?.title ?? m.description ?? m.url,
                      type: "image/jpeg",
                      createdAt: new Date(),
                      updatedAt: new Date(),
                      creator,
                      events: [],
                      areas: [],
                      links: [],
                      stories: [],
                      keywords: [],
                      featuredIn: [],
                      deletedAt: null,
                      extra: null,
                    }),
                  ),
                ),
              ),
            ),
          ),
          fp.O.getOrElse(() =>
            TE.right<ControllerError, O.Option<MediaEntity>>(O.none),
          ),
          TE.map((image) => ({
            ...m,
            image: pipe(image, fp.O.toNullable),
          })),
        ),
      ),
      TE.map((meta): LinkEntity => {
        ctx.logger.debug.log("Creating link %O", meta);
        let publishDate: any = DateFromISOString.decode(meta.date);
        if (E.isRight(publishDate)) {
          publishDate = publishDate.right;
        } else {
          publishDate = undefined;
        }

        return {
          id: uuid() as any,
          title: meta.title,
          url: url as any,
          description: meta.description ??  meta.title,
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
export const fetchAndSave: TEFlow<[UserEntity, URL], LinkEntity> =
  (ctx) => (u, url) => {
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
          fetchAsLink(ctx)(u, sanitizedURL, undefined),
          TE.chain((l) => ctx.db.save(LinkEntity, [l])),
          TE.map((ll) => ll[0]),
        );
      }),
    );
  };
