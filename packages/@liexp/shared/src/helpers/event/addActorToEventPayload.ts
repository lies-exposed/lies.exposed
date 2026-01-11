import { type UUID } from "../../io/http/Common/UUID.js";
import { EVENT_TYPES } from "../../io/http/Events/EventType.js";
import { type Event } from "../../io/http/Events/index.js";

/**
 * Adds an actor ID to the event payload.
 * Handles all event types correctly based on their specific payload structure.
 * Returns null if the event type doesn't support actor arrays (e.g., Death, Quote).
 *
 * @param event - The event entity to update
 * @param actorId - The actor ID to add
 * @returns The updated event with the actor added to its payload, or null if not applicable
 */
export const addActorToEventPayload = <
  E extends { type: Event["type"]; payload: Record<string, unknown> },
>(
  event: E,
  actorId: UUID,
): E["payload"] | null => {
  const addToArray = (arr: UUID[] | undefined): UUID[] => {
    const existing = arr ?? [];
    if (existing.includes(actorId)) return existing;
    return [...existing, actorId];
  };

  const payload = event.payload;

  switch (event.type) {
    case EVENT_TYPES.PATENT: {
      const owners = (payload.owners as { actors: UUID[]; groups: UUID[] }) ?? {
        actors: [],
        groups: [],
      };
      return {
        ...payload,
        owners: {
          ...owners,
          actors: addToArray(owners.actors),
        },
      };
    }

    case EVENT_TYPES.DOCUMENTARY: {
      // Add actor to subjects by default (could be made configurable)
      const subjects = (payload.subjects as {
        actors: UUID[];
        groups: UUID[];
      }) ?? { actors: [], groups: [] };
      return {
        ...payload,
        subjects: {
          ...subjects,
          actors: addToArray(subjects.actors),
        },
      };
    }

    case EVENT_TYPES.SCIENTIFIC_STUDY: {
      const authors = (payload.authors as UUID[]) ?? [];
      return {
        ...payload,
        authors: addToArray(authors),
      };
    }

    case EVENT_TYPES.UNCATEGORIZED:
    default: {
      const actors = (payload.actors as UUID[]) ?? [];
      return {
        ...payload,
        actors: addToArray(actors),
      };
    }

    // These event types don't support adding actors via this method
    case EVENT_TYPES.DEATH:
    case EVENT_TYPES.QUOTE:
    case EVENT_TYPES.TRANSACTION:
    case EVENT_TYPES.BOOK:
      return null;
  }
};

/**
 * Removes an actor ID from the event payload.
 * Handles all event types correctly based on their specific payload structure.
 *
 * @param event - The event entity to update
 * @param actorId - The actor ID to remove
 * @returns The updated event with the actor removed from its payload
 */
export const removeActorFromEventPayload = <
  E extends { type: Event["type"]; payload: Record<string, unknown> },
>(
  event: E,
  actorId: UUID,
): E["payload"] => {
  const removeFromArray = (arr: UUID[] | undefined): UUID[] => {
    if (!arr) return [];
    return arr.filter((id) => id !== actorId);
  };

  const payload = event.payload;

  switch (event.type) {
    case EVENT_TYPES.PATENT: {
      const owners = (payload.owners as { actors: UUID[]; groups: UUID[] }) ?? {
        actors: [],
        groups: [],
      };
      return {
        ...payload,
        owners: {
          ...owners,
          actors: removeFromArray(owners.actors),
        },
      };
    }

    case EVENT_TYPES.DOCUMENTARY: {
      const authors = (payload.authors as {
        actors: UUID[];
        groups: UUID[];
      }) ?? { actors: [], groups: [] };
      const subjects = (payload.subjects as {
        actors: UUID[];
        groups: UUID[];
      }) ?? { actors: [], groups: [] };
      return {
        ...payload,
        authors: {
          ...authors,
          actors: removeFromArray(authors.actors),
        },
        subjects: {
          ...subjects,
          actors: removeFromArray(subjects.actors),
        },
      };
    }

    case EVENT_TYPES.SCIENTIFIC_STUDY: {
      const authors = (payload.authors as UUID[]) ?? [];
      return {
        ...payload,
        authors: removeFromArray(authors),
      };
    }

    case EVENT_TYPES.UNCATEGORIZED:
    default: {
      const actors = (payload.actors as UUID[]) ?? [];
      return {
        ...payload,
        actors: removeFromArray(actors),
      };
    }

    // These event types don't support removing actors via this method
    case EVENT_TYPES.DEATH:
    case EVENT_TYPES.QUOTE:
    case EVENT_TYPES.TRANSACTION:
    case EVENT_TYPES.BOOK:
      return event.payload;
  }
};

export const addActorToEvent = <
  E extends { type: Event["type"]; payload: Record<string, unknown> },
>(
  event: E,
  actorId: UUID,
) => {
  return {
    ...event,
    payload: addActorToEventPayload(event, actorId),
  };
};

export const removeActorFromEvent = <
  E extends { type: Event["type"]; payload: Record<string, unknown> },
>(
  event: E,
  actorId: UUID,
) => {
  return {
    ...event,
    payload: removeActorFromEventPayload(event, actorId),
  };
};
