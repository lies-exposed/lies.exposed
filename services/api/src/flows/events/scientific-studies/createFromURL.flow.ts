import { pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { findByURL } from "../../../queries/events/scientificStudy.query.js";
import { extractFromURL } from "../extractFromURL.flow.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { ServerError, toControllerError } from "#io/ControllerError.js";

export const createEventFromURL: TEFlow<[UserEntity, URL], EventV2Entity> =
  (ctx) => (user, url) => {
    return pipe(
      findByURL(ctx)(url),
      TE.chain((existingEvent) => {
        if (O.isNone(existingEvent)) {
          return pipe(
            ctx.puppeteer.getBrowser({}),
            TE.mapLeft(toControllerError),
            TE.chain((b) =>
              pipe(
                TE.tryCatch(
                  () => b.pages().then((p) => p[0]),
                  toControllerError,
                ),
                TE.chain((p) =>
                  extractFromURL(ctx)(p, user, {
                    type: SCIENTIFIC_STUDY.value,
                    url,
                  }),
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
              return TE.left(ServerError());
            }),
            TE.chain(([result]) =>
              ctx.db.findOneOrFail(EventV2Entity, {
                where: { id: Equal(result.id) },
                loadRelationIds: {
                  relations: ["media", "links", "keywords"],
                },
              }),
            ),
          );
        }
        return TE.right(existingEvent.value);
      }),
    );
  };
