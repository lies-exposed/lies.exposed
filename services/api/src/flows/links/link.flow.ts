import { type LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { type UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { fromURL } from "@liexp/backend/lib/flows/links/link.flow.js";
import { LinkRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type TEReader } from "../flow.types.js";
import { type ServerContext } from "#context/context.type.js";
import { toControllerError } from "#io/ControllerError.js";

/**
 * Fetch open graph metadata from the given url and creates a LinkEntity.
 */
export const fetchAndSave = (u: UserEntity, url: URL): TEReader<LinkEntity> => {
  return pipe(
    fp.RTE.right(sanitizeURL(url)),
    LoggerService.RTE.debug(["Searching link with url %s", url]),
    fp.RTE.chain((sanitizedURL) =>
      LinkRepository.findOne<ServerContext>({
        where: { url: Equal(sanitizedURL) },
      }),
    ),
    fp.RTE.chain((optLink) => (ctx) => {
      if (O.isSome(optLink)) {
        ctx.logger.debug.log("Link found! %s", optLink.value.id);
        return TE.right(optLink.value);
      }

      ctx.logger.debug.log("Link not found, fetching...");
      return pipe(
        fromURL(u, url, undefined)(ctx),
        TE.mapLeft(toControllerError),
        TE.chain((l) => LinkRepository.save([l])(ctx)),
        TE.map((ll) => ll[0]),
      );
    }),
  );
};
