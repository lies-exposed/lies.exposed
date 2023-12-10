import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type EventEntity } from "#entities/archive/Event.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";

export const toEventIO = (
  event: EventEntity,
): E.Either<ControllerError, io.http.Events.Event> => {
  return pipe(
    io.http.Events.Event.decode({
      ...event,
      type: "Uncategorized",
      location: event.location ? event.location : undefined,
      topics: [],
      media: event.media.map((m) =>
        UUID.is(m)
          ? m
          : {
              ...m,
              thumbnail: m.thumbnail ?? undefined,
            },
      ),
      startDate: event.startDate.toISOString(),
      endDate: event.endDate ? event.endDate.toISOString() : undefined,
      date: new Date().toISOString(),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
      deletedAt: event.deletedAt?.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode event (${event.id})`, e)),
  );
};
