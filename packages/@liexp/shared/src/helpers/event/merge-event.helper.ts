import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type BlockNoteDocument } from "../../io/http/Common/BlockNoteDocument.js";
import { type UUID } from "../../io/http/Common/UUID.js";
import { type BookPayload } from "../../io/http/Events/Book.js";
import { type DeathPayload } from "../../io/http/Events/Death.js";
import { type DocumentaryPayload } from "../../io/http/Events/Documentary.js";
import { EVENT_TYPES, type EventType } from "../../io/http/Events/EventType.js";
import { type PatentPayload } from "../../io/http/Events/Patent.js";
import { type QuotePayload } from "../../io/http/Events/Quote.js";
import { type ScientificStudyPayload } from "../../io/http/Events/ScientificStudy.js";
import { type TransactionPayload } from "../../io/http/Events/Transaction.js";
import { type UncategorizedV2Payload } from "../../io/http/Events/Uncategorized.js";
import {
  type EventRelationIds,
  type Event,
  type EventRelations,
} from "../../io/http/Events/index.js";
import { makeBySubjectId } from "../../io/utils/BySubjectUtils.js";
import { eventRelationIdsMonoid } from "./event.helper.js";
import { getRelationIds } from "./getEventRelationIds.js";

/**
 * Extracts unique IDs from a list of entities or UUIDs
 */
export const getUniqueIds = <T extends { id: UUID }>(
  items: (T | UUID)[] | null | undefined,
): UUID[] => {
  if (!items) return [];
  const ids = items.map((item) => (typeof item === "string" ? item : item.id));
  return [...new Set(ids)];
};

/**
 * Merges actors/groups into a payload based on the target event type.
 */
const mergeEntitiesIntoPayloadByType = (
  basePayload: Record<string, unknown>,
  targetType: EventType,
  relations: EventRelationIds,
): Event["payload"] => {
  const { actors, groups, groupsMembers, media, links } = relations;
  switch (targetType) {
    case EVENT_TYPES.UNCATEGORIZED:
      return {
        ...basePayload,
        actors,
        groups,
        groupsMembers,
      } as UncategorizedV2Payload;

    case EVENT_TYPES.DOCUMENTARY:
      return {
        ...basePayload,
        subjects: {
          actors,
          groups,
        },
        media: media[0],
      } as DocumentaryPayload;

    case EVENT_TYPES.PATENT:
      return {
        ...basePayload,
        owners: { actors, groups },
      } as PatentPayload;

    case EVENT_TYPES.SCIENTIFIC_STUDY:
      return {
        ...basePayload,
        authors: actors,
        image: media[0],
        url: links[0],
      } as ScientificStudyPayload;

    case EVENT_TYPES.QUOTE:
      return {
        ...basePayload,
        quote: basePayload.quote ?? basePayload.title ?? "Unknown Quote",
        details: undefined,
      } as QuotePayload;
    case EVENT_TYPES.DEATH:
      return {
        ...basePayload,
      } as DeathPayload;
    case EVENT_TYPES.TRANSACTION:
      return {
        ...basePayload,
      } as TransactionPayload;
    case EVENT_TYPES.BOOK:
      return {
        ...basePayload,
        title: (basePayload.title as string) ?? "Unknown Book",
        authors: actors.map((a) => makeBySubjectId("Actor", a)),
        publisher: undefined,
        media: { pdf: media[0], audio: undefined },
      } as BookPayload;
    default:
      return basePayload as unknown as Event["payload"];
  }
};

/**
 * Concatenates BlockNoteDocument arrays, filtering out nullish values
 */
const concatBlockNoteDocuments = (
  docs: (BlockNoteDocument | null | undefined)[],
): BlockNoteDocument | null => {
  const validDocs = docs.filter(
    (doc): doc is BlockNoteDocument => doc != null && Array.isArray(doc),
  );
  if (validDocs.length === 0) return null;
  return validDocs.flat() as BlockNoteDocument;
};

/**
 * Merges unique UUIDs from multiple arrays
 */
const mergeUniqueUUIDs = (arrays: UUID[][]): UUID[] => {
  return [...new Set(arrays.flat())];
};

const mergeEvents = (
  events: readonly Event[],
  toType: EventType,
  _relations: EventRelations,
): Event => {
  if (events.length === 1) {
    return events[0];
  }

  const [first] = events;

  // Collect all relation IDs from all events using the monoid
  const mergedRelationIds = pipe(
    events,
    fp.A.reduce(eventRelationIdsMonoid.empty, (acc, e) =>
      eventRelationIdsMonoid.concat(acc, getRelationIds(e)),
    ),
  );

  // Concatenate excerpt and body from all events
  const mergedExcerpt = concatBlockNoteDocuments(events.map((e) => e.excerpt));
  const mergedBody = concatBlockNoteDocuments(events.map((e) => e.body));

  // Merge common event properties (links, media, keywords)
  const mergedLinks = mergeUniqueUUIDs(events.map((e) => [...e.links]));
  const mergedMedia = mergeUniqueUUIDs(events.map((e) => [...e.media]));
  const mergedKeywords = mergeUniqueUUIDs(events.map((e) => [...e.keywords]));

  // Create the merged payload based on the target type
  const mergedPayload = mergeEntitiesIntoPayloadByType(
    first.payload,
    toType,
    mergedRelationIds,
  );

  return {
    ...first,
    id: first.id,
    type: toType,
    payload: mergedPayload,
    excerpt: mergedExcerpt,
    body: mergedBody,
    links: mergedLinks,
    media: mergedMedia,
    keywords: mergedKeywords,
  } as Event;
};

export const MergeEventsHelper = {
  getUniqueIds,
  mergeEvents,
};
