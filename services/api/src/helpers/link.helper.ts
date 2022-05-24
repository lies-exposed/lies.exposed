import { URL } from "@liexp/shared/io/http/Common";
import { sanitizeURL } from '@liexp/shared/utils/url.utils';
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from 'fp-ts/lib/function';
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
      ctx.urlMetadata.fetchMetadata(url, {}, (e) => ServerError()),
      TE.chain((meta) =>
        ctx.db.save(LinkEntity, [
          {
            ...meta,
            title: meta.title,
            description: meta.description,
            keywords: [],
            url: sanitizeURL(url),
          },
        ])
      ),
      TE.map((ll) => ll[0])
    );
  };
