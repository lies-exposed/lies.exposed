import { fp } from "@liexp/core/lib/fp";
import { type URL } from "@liexp/shared/lib/io/http/Common";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import { type TEFlow } from "./flow.types";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { type UserEntity } from "@entities/User.entity";
import { ServerError, type ControllerError } from "@io/ControllerError";

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
                      thumbnail: image,
                      location: image,
                      description: m.description ?? m.url,
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

        const link = new LinkEntity();
        link.id = uuid() as any;
        link.title = meta.title;
        link.url = url as any;
        link.description = meta.description;
        link.publishDate = publishDate;
        link.image = meta.image;
        link.createdAt = new Date();
        link.updatedAt = new Date();

        return link;
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
