import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID, type URL } from "@liexp/shared/lib/io/http/Common/index.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as O from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { type ConfigContext } from "../../context/config.context.js";
import { type DatabaseContext } from "../../context/db.context.js";
import { type FSClientContext } from "../../context/fs.context.js";
import {
  type NERProviderContext,
  type URLMetadataContext,
} from "../../context/index.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type PuppeteerProviderContext } from "../../context/puppeteer.context.js";
import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { ServerError } from "../../errors/ServerError.js";
import { findByURL } from "../../queries/events/scientificStudy.query.js";
import { extractEventFromURL } from "./extractFromURL.flow.js";

export const createEventFromURL = <
  C extends LoggerContext &
    ConfigContext &
    FSClientContext &
    NERProviderContext &
    DatabaseContext &
    URLMetadataContext &
    PuppeteerProviderContext,
>(
  user: UserEntity,
  eventId: UUID,
  url: URL,
  type: EventType,
): ReaderTaskEither<C, ServerError, EventV2Entity> => {
  return pipe(
    findByURL<C>(url),
    fp.RTE.chain((existingEvent) => {
      if (O.isSome(existingEvent)) {
        return fp.RTE.right(existingEvent.value);
      }

      return pipe(
        fp.RTE.ask<C>(),
        fp.RTE.chainTaskEitherK((ctx) =>
          pipe(
            ctx.puppeteer.execute({}, (b) => {
              return pipe(
                TE.tryCatch(
                  () => b.pages().then((p) => p[0]),
                  ServerError.fromUnknown,
                ),
                TE.chain((p) =>
                  extractEventFromURL(p, user, {
                    type,
                    url,
                  })(ctx),
                ),
              );
            }),
            TE.chain((meta) => {
              if (O.isSome(meta)) {
                return ctx.db.save(EventV2Entity, [
                  { ...meta.value, id: eventId },
                ]);
              }

              return TE.left(
                ServerError.fromUnknown(
                  new Error(`No event can be extracted from url #{url} `),
                ),
              );
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
