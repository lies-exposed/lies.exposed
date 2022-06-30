import { URL } from "@liexp/shared/io/http/Common";
import { uuid } from "@liexp/shared/utils/uuid";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { LinkEntity } from "@entities/Link.entity";
import { ControllerError, ServerError } from "@io/ControllerError";
import { RouteContext } from "@routes/route.types";
/**
 * Fetch open graph metadata from the given url and creates a LinkEntity.
 */
export const fetchAndCreate =
  (ctx: RouteContext) =>
  (url: URL): TE.TaskEither<ControllerError, LinkEntity> => {
    return pipe(
      ctx.db.findOne(LinkEntity, { where: { url } }),
      TE.chain((optLink) => {
        if (O.isSome(optLink)) {
          return TE.right(optLink.value);
        }

        return pipe(
          ctx.urlMetadata.fetchMetadata(url, {}, (e) => ServerError()),
          TE.chain((meta) =>
            ctx.db.save(LinkEntity, [
              {
                ...meta,
                title: meta.title,
                description: meta.description,
                keywords: [],
                image: meta.image
                  ? {
                      id: uuid(),
                      thumbnail: meta.image,
                      location: meta.image,
                      description: meta.description ?? meta.url,
                      publishDate: meta.date ?? new Date(),
                    }
                  : null,
                url: url,
              },
            ])
          ),
          TE.map((ll) => ll[0])
        );
      })
    );
  };
