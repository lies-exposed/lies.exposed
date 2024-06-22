import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/Either";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";

export const toDocumentaryIO = (
  event: EventV2Entity,
): E.Either<ControllerError, io.http.Events.Documentary.Documentary> => {
  const p: any = event.payload;
  return pipe(
    io.http.Events.Documentary.Documentary.decode({
      ...event,
      payload: {
        ...p,
        website: p?.website ?? undefined,
      },
      excerpt: event.excerpt ?? undefined,
      body: event.body ?? undefined,
      date: event.date.toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      deletedAt: event.deletedAt?.toISOString() ?? undefined,
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode event (${event.id})`, e)),
  );
};
