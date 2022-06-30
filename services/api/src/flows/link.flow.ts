import { URL } from "@liexp/shared/io/http/Common";
import { parseISO } from "@liexp/shared/utils/date";
import { uuid } from "@liexp/shared/utils/uuid";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { LinkEntity } from "@entities/Link.entity";
import { MediaEntity } from "@entities/Media.entity";
import { ControllerError, ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";

export const fetchAsLink =
  (ctx: RouteContext) =>
  (url: URL): TE.TaskEither<ControllerError, LinkEntity> => {
    return pipe(
      ctx.urlMetadata.fetchMetadata(url, {}, (e) => ServerError()),
      TE.map((meta): LinkEntity => {
        const image = new MediaEntity();
        image.id = uuid() as any;
        image.thumbnail = meta.image;
        image.location = meta.image ?? "";
        image.description = meta.description ?? meta.url;
        image.type = "image/jpeg";
        image.createdAt = new Date();
        image.updatedAt = new Date();

        const link = new LinkEntity();
        link.id = uuid() as any;
        link.title = meta.title;
        link.url = meta.url;
        link.description = meta.description;
        link.publishDate = meta.date ? parseISO(meta.date) : new Date();
        link.image = image;
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
  (url: URL): TE.TaskEither<ControllerError, LinkEntity> => {
    return pipe(
      ctx.db.findOne(LinkEntity, { where: { url } }),
      TE.chain((optLink) => {
        if (O.isSome(optLink)) {
          return TE.right(optLink.value);
        }

        return pipe(
          fetchAsLink(ctx)(url),
          TE.chain((l) => ctx.db.save(LinkEntity, [l])),
          TE.map((ll) => ll[0])
        );
      })
    );
  };
