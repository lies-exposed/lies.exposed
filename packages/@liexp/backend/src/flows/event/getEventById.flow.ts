import { pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { Equal } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { type ServerError } from "../../errors/ServerError.js";

export interface GetEventByIdOptions {
  /**
   * Whether to include deleted events in the result.
   * Should be true for admin users, false otherwise.
   */
  withDeleted: boolean;
}

/**
 * Retrieves a single event by its ID.
 *
 * @param id - The UUID of the event to retrieve
 * @param options - Options for retrieving the event (e.g., withDeleted for admins)
 * @returns A ReaderTaskEither that resolves to the event entity with loaded relation IDs
 *
 * @example
 * ```typescript
 * const event = await pipe(
 *   getEventById(eventId, { withDeleted: isAdmin }),
 *   throwRTE(ctx)
 * );
 * ```
 */
export const getEventById = <C extends DatabaseContext>(
  id: UUID,
  options: GetEventByIdOptions,
): ReaderTaskEither<C, ServerError, EventV2Entity> => {
  return ({ db }) =>
    pipe(
      db.findOneOrFail(EventV2Entity, {
        where: { id: Equal(id) },
        loadRelationIds: {
          relations: ["links", "media", "keywords"],
        },
        withDeleted: options.withDeleted,
      }),
    );
};
