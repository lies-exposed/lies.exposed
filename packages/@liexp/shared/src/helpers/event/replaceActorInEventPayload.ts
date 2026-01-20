import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { type Event } from "@liexp/io/lib/http/Events/index.js";

interface ReplaceActorInput {
  sourceId: UUID;
  targetId: UUID;
}

/**
 * Replaces an actor ID with another in the event payload.
 * Handles all event types correctly based on their specific payload structure.
 *
 * @param event - The event entity to update
 * @param input - The source and target actor IDs
 * @returns The updated event with the actor replaced in its payload
 */
export const replaceActorInEventPayload = <
  E extends { type: Event["type"]; payload: Record<string, unknown> },
>(
  event: E,
  { sourceId, targetId }: ReplaceActorInput,
): E => {
  const replaceInArray = (arr: UUID[]): UUID[] => {
    if (!arr.includes(sourceId)) return arr;
    return arr
      .filter((id) => id !== sourceId)
      .concat(arr.includes(targetId) ? [] : [targetId]);
  };

  const replaceBySubject = <T extends { type: string; id: UUID }>(
    subject: T | undefined,
  ): T | undefined => {
    if (!subject || subject.type !== "Actor" || subject.id !== sourceId) {
      return subject;
    }
    return { ...subject, id: targetId };
  };

  const replaceBySubjectArray = <T extends { type: string; id: UUID }>(
    arr: T[],
  ): T[] => {
    const hasSource = arr.some((s) => s.type === "Actor" && s.id === sourceId);
    if (!hasSource) return arr;

    const hasTarget = arr.some((s) => s.type === "Actor" && s.id === targetId);
    return arr
      .filter((s) => !(s.type === "Actor" && s.id === sourceId))
      .concat(hasTarget ? [] : [{ type: "Actor", id: targetId } as T]);
  };

  const payload = event.payload;

  switch (event.type) {
    case EVENT_TYPES.BOOK: {
      const authors = payload.authors as { type: string; id: UUID }[];
      const publisher = payload.publisher as
        | { type: string; id: UUID }
        | undefined;
      return {
        ...event,
        payload: {
          ...payload,
          authors: replaceBySubjectArray(authors),
          publisher: replaceBySubject(publisher),
        },
      };
    }

    case EVENT_TYPES.QUOTE: {
      const subject = payload.subject as { type: string; id: UUID } | undefined;
      return {
        ...event,
        payload: {
          ...payload,
          subject: replaceBySubject(subject),
        },
      };
    }

    case EVENT_TYPES.DEATH: {
      const victim = payload.victim as UUID;
      return {
        ...event,
        payload: {
          ...payload,
          victim: victim === sourceId ? targetId : victim,
        },
      };
    }

    case EVENT_TYPES.TRANSACTION: {
      const from = payload.from as { type: string; id: UUID };
      const to = payload.to as { type: string; id: UUID };
      return {
        ...event,
        payload: {
          ...payload,
          from: replaceBySubject(from) ?? from,
          to: replaceBySubject(to) ?? to,
        },
      };
    }

    case EVENT_TYPES.PATENT: {
      const owners = payload.owners as { actors: UUID[]; groups: UUID[] };
      return {
        ...event,
        payload: {
          ...payload,
          owners: {
            ...owners,
            actors: replaceInArray(owners.actors),
          },
        },
      };
    }

    case EVENT_TYPES.DOCUMENTARY: {
      const authors = payload.authors as { actors: UUID[]; groups: UUID[] };
      const subjects = payload.subjects as { actors: UUID[]; groups: UUID[] };
      return {
        ...event,
        payload: {
          ...payload,
          authors: {
            ...authors,
            actors: replaceInArray(authors.actors),
          },
          subjects: {
            ...subjects,
            actors: replaceInArray(subjects.actors),
          },
        },
      };
    }

    case EVENT_TYPES.SCIENTIFIC_STUDY: {
      const authors = payload.authors as UUID[];
      return {
        ...event,
        payload: {
          ...payload,
          authors: replaceInArray(authors),
        },
      };
    }

    case EVENT_TYPES.UNCATEGORIZED:
    default: {
      const actors = payload.actors as UUID[];
      return {
        ...event,
        payload: {
          ...payload,
          actors: replaceInArray(actors),
        },
      };
    }
  }
};
