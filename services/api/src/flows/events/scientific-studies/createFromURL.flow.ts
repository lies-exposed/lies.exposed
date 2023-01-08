import { type URL } from "@liexp/shared/lib/io/http/Common";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/ScientificStudy";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from "typeorm";
import { findByURL } from "../../../queries/events/scientificStudy.query";
import { extractFromURL } from "../extractFromURL.flow";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type UserEntity } from "@entities/User.entity";
import { type TEFlow } from "@flows/flow.types";
import {
  ServerError,
  toControllerError
} from "@io/ControllerError";

export const createEventFromURL: TEFlow<[UserEntity, URL], EventV2Entity> =
  (ctx) => (user, url) => {
    return pipe(
      findByURL(ctx)(url),
      TE.chain((existingEvent) => {
        if (O.isNone(existingEvent)) {
          return pipe(
            ctx.puppeteer.getBrowser({ headless: true }),
            TE.mapLeft(toControllerError),
            TE.chain((b) =>
              pipe(
                TE.tryCatch(
                  () => b.pages().then((p) => p[0]),
                  toControllerError
                ),
                TE.chain((p) =>
                  extractFromURL(ctx)(p, user, {
                    type: SCIENTIFIC_STUDY.value,
                    url,
                  })
                ),
                TE.chainFirst(() => {
                  return TE.tryCatch(() => b.close(), toControllerError);
                })
              )
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
              })
            )
          );
        }
        return TE.right(existingEvent.value);
      })
    );
  };
