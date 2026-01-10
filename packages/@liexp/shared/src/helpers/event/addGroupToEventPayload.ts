import { type UUID } from "../../io/http/Common/UUID.js";
import { EVENT_TYPES } from "../../io/http/Events/EventType.js";
import { type Event } from "../../io/http/Events/index.js";

/**
 * Adds a group ID to the event payload.
 * Handles all event types correctly based on their specific payload structure.
 * Returns null if the event type doesn't support group arrays.
 *
 * @param event - The event entity to update
 * @param groupId - The group ID to add
 * @returns The updated event with the group added to its payload, or null if not applicable
 */
export const addGroupToEventPayload = <
  E extends { type: Event["type"]; payload: Record<string, unknown> },
>(
  event: E,
  groupId: UUID,
): E | null => {
  const addToArray = (arr: UUID[] | undefined): UUID[] => {
    const existing = arr ?? [];
    if (existing.includes(groupId)) return existing;
    return [...existing, groupId];
  };

  const payload = event.payload;

  switch (event.type) {
    case EVENT_TYPES.PATENT: {
      const owners = (payload.owners as { actors: UUID[]; groups: UUID[] }) ?? {
        actors: [],
        groups: [],
      };
      return {
        ...event,
        payload: {
          ...payload,
          owners: {
            ...owners,
            groups: addToArray(owners.groups),
          },
        },
      };
    }

    case EVENT_TYPES.DOCUMENTARY: {
      // Add group to subjects by default (could be made configurable)
      const subjects = (payload.subjects as {
        actors: UUID[];
        groups: UUID[];
      }) ?? { actors: [], groups: [] };
      return {
        ...event,
        payload: {
          ...payload,
          subjects: {
            ...subjects,
            groups: addToArray(subjects.groups),
          },
        },
      };
    }

    case EVENT_TYPES.UNCATEGORIZED:
    default: {
      const groups = (payload.groups as UUID[]) ?? [];
      return {
        ...event,
        payload: {
          ...payload,
          groups: addToArray(groups),
        },
      };
    }

    // These event types don't support adding groups via this method
    case EVENT_TYPES.DEATH:
    case EVENT_TYPES.QUOTE:
    case EVENT_TYPES.TRANSACTION:
    case EVENT_TYPES.BOOK:
    case EVENT_TYPES.SCIENTIFIC_STUDY:
      return null;
  }
};

/**
 * Removes a group ID from the event payload.
 * Handles all event types correctly based on their specific payload structure.
 *
 * @param event - The event entity to update
 * @param groupId - The group ID to remove
 * @returns The updated event with the group removed from its payload
 */
export const removeGroupFromEventPayload = <
  E extends { type: Event["type"]; payload: Record<string, unknown> },
>(
  event: E,
  groupId: UUID,
): E => {
  const removeFromArray = (arr: UUID[] | undefined): UUID[] => {
    if (!arr) return [];
    return arr.filter((id) => id !== groupId);
  };

  const payload = event.payload;

  switch (event.type) {
    case EVENT_TYPES.PATENT: {
      const owners = (payload.owners as { actors: UUID[]; groups: UUID[] }) ?? {
        actors: [],
        groups: [],
      };
      return {
        ...event,
        payload: {
          ...payload,
          owners: {
            ...owners,
            groups: removeFromArray(owners.groups),
          },
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
        ...event,
        payload: {
          ...payload,
          authors: {
            ...authors,
            groups: removeFromArray(authors.groups),
          },
          subjects: {
            ...subjects,
            groups: removeFromArray(subjects.groups),
          },
        },
      };
    }

    case EVENT_TYPES.UNCATEGORIZED:
    default: {
      const groups = (payload.groups as UUID[]) ?? [];
      return {
        ...event,
        payload: {
          ...payload,
          groups: removeFromArray(groups),
        },
      };
    }

    // These event types don't support removing groups via this method
    case EVENT_TYPES.DEATH:
    case EVENT_TYPES.QUOTE:
    case EVENT_TYPES.TRANSACTION:
    case EVENT_TYPES.BOOK:
    case EVENT_TYPES.SCIENTIFIC_STUDY:
      return event;
  }
};
