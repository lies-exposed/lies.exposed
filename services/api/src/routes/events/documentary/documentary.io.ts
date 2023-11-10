import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

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
