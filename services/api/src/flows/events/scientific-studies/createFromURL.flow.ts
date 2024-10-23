import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { findByURL } from "../../../queries/events/scientificStudy.query.js";
import { extractEventFromURL } from "../extractFromURL.flow.js";
import { type ServerContext } from "#context/context.type.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";

export const createEventFromURL = (
  user: UserEntity,
  url: URL,
): TEReader<EventV2Entity> => {
  return pipe(
    findByURL(url),
    fp.RTE.chain((existingEvent) => {
      if (O.isSome(existingEvent)) {
        return fp.RTE.right(existingEvent.value);
      }

      return pipe(
        fp.RTE.ask<ServerContext>(),
        fp.RTE.chainTaskEitherK((ctx) =>
          pipe(
            ctx.puppeteer.getBrowser({}),
            TE.mapLeft(toControllerError),
            TE.chain((b) =>
              pipe(
                TE.tryCatch(
                  () => b.pages().then((p) => p[0]),
                  toControllerError,
                ),
                TE.chain((p) =>
                  extractEventFromURL(p, user, {
                    type: SCIENTIFIC_STUDY.value,
                    url,
                  })(ctx),
                ),
                TE.chainFirst(() => {
                  return TE.tryCatch(() => b.close(), toControllerError);
                }),
              ),
            ),
            TE.chain((meta) => {
              if (O.isSome(meta)) {
                return ctx.db.save(EventV2Entity, [meta.value]);
              }
              return TE.left(ServerError.of());
            }),
            TE.chain(([result]) =>
              ctx.db.findOneOrFail(EventV2Entity, {
                where: { id: Equal(result.id) },
                loadRelationIds: {
                  relations: ["media", "links", "keywords"],
                },
              }),
            ),
          ),
        ),
      );
    }),
  );
};
