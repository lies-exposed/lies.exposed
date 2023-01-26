import { fp } from "@liexp/core/fp";
import { type URL } from "@liexp/shared/io/http/Common";
import { uuid } from "@liexp/shared/utils/uuid";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { type Metadata } from "page-metadata-parser";
import { Equal } from "typeorm";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { type UserEntity } from "@entities/User.entity";
import { ServerError, type ControllerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const fetchAsLink =
  (ctx: RouteContext) =>
  (
    creator: UserEntity,
    url: URL,
    defaults?: Partial<Metadata>
  ): TE.TaskEither<ControllerError, LinkEntity> => {
    return pipe(
      ctx.urlMetadata.fetchMetadata(url, {}, (e) =>
        ServerError([`Error fetching metadata from url ${url}`])
      ),
      TE.orElse((e) =>
        TE.right<ControllerError, Partial<Metadata>>({
          keywords: [],
          url: url as string,
        })
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
                      articles: [],
                      keywords: [],
                      deletedAt: null,
                    })
                  )
                )
              )
            )
          ),
          fp.O.getOrElse(() =>
            TE.right<ControllerError, O.Option<MediaEntity>>(O.none)
          ),
          TE.map((image) => ({
            ...m,
            image: pipe(
              image,
              fp.O.toNullable
            ),
          }))
        )
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
        link.url = meta.url as any;
        link.description = meta.description;
        link.publishDate = publishDate;
        link.image = meta.image;
        link.createdAt = new Date();
        link.updatedAt = new Date();

        return link;
      })
    );
  };

/**
 * Fetch open graph metadata from the given url and creates a LinkEntity.
 */
export const fetchAndSave =
  (ctx: RouteContext) =>
  (u: UserEntity, url: URL): TE.TaskEither<ControllerError, LinkEntity> => {
    ctx.logger.debug.log("Searching link with url %s", url);
    return pipe(
      ctx.db.findOne(LinkEntity, { where: { url: Equal(url) } }),
      TE.chain((optLink) => {
        if (O.isSome(optLink)) {
          ctx.logger.debug.log("Link found! %s", optLink.value.id);
          return TE.right(optLink.value);
        }

        ctx.logger.debug.log("Link not found, fetching...");
        return pipe(
          fetchAsLink(ctx)(u, url),
          TE.chain((l) => ctx.db.save(LinkEntity, [l])),
          TE.map((ll) => ll[0])
        );
      })
    );
  };
