import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { type UncategorizedV2Payload } from "@liexp/io/lib/http/Events/Uncategorized.js";
import { type Event } from "@liexp/io/lib/http/Events/index.js";
import {
  type UpdateEventAgentOutput,
  type UpdateEventAgentOutputChange,
  type UpdateEventAgentOutputMissing,
} from "@liexp/io/lib/http/Queue/event/UpdateEventQueue.js";
import { toInitialValue } from "../../providers/blocknote/utils.js";

export interface EventExtractionReport {
  missing: UpdateEventAgentOutputMissing;
  changes: UpdateEventAgentOutputChange[];
}

export type MergeEventExtractionResult = Event & {
  report: EventExtractionReport;
};

const unionUUIDs = (a: readonly UUID[], b: readonly UUID[]): UUID[] => [
  ...new Set([...a, ...b]),
];

const toDisplayValue = (v: unknown): string | null => {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return null;
};

const recordChange = (
  changes: UpdateEventAgentOutputChange[],
  field: string,
  before: unknown,
  after: unknown,
): void => {
  changes.push({
    field,
    before: toDisplayValue(before),
    after: toDisplayValue(after),
  });
};

const toStringValue = (v: string | undefined): string | undefined => v;

/**
 * Applies the scalar keys of an agent extraction onto an event, restricted to
 * the keys that exist in the event type's payload. Null values in the output
 * are ignored: they mean "not extracted", not "clear this field".
 */
const applyScalars = (
  event: Event,
  output: UpdateEventAgentOutput,
  changes: UpdateEventAgentOutputChange[],
): Event => {
  const payload = { ...(event.payload as Record<string, unknown>) };

  const titleTypes = new Set<string>([
    EVENT_TYPES.BOOK,
    EVENT_TYPES.DOCUMENTARY,
    EVENT_TYPES.PATENT,
    EVENT_TYPES.SCIENTIFIC_STUDY,
    EVENT_TYPES.TRANSACTION,
    EVENT_TYPES.UNCATEGORIZED,
  ]);

  if (output.title !== null && titleTypes.has(event.type)) {
    if (payload.title !== output.title) {
      recordChange(changes, "title", payload.title, output.title);
      payload.title = output.title;
    }
  }

  if (output.date !== null) {
    const nextDate = new Date(output.date);
    if (
      !Number.isNaN(nextDate.getTime()) &&
      event.date.getTime() !== nextDate.getTime()
    ) {
      recordChange(
        changes,
        "date",
        event.date.toISOString(),
        nextDate.toISOString(),
      );
      event = { ...event, date: nextDate };
    }
  }

  if (output.excerpt !== null) {
    const excerpt = toInitialValue(output.excerpt);
    if (excerpt) {
      recordChange(changes, "excerpt", undefined, output.excerpt);
      event = { ...event, excerpt };
    }
  }

  if (output.location !== null && "location" in payload) {
    if (payload.location !== output.location) {
      recordChange(changes, "location", payload.location, output.location);
      payload.location = output.location;
    }
  }

  if (output.endDate !== null && event.type === EVENT_TYPES.UNCATEGORIZED) {
    const nextEndDate = new Date(output.endDate);
    const currentEndDate = payload.endDate as Date | undefined;
    if (
      !Number.isNaN(nextEndDate.getTime()) &&
      currentEndDate?.getTime() !== nextEndDate.getTime()
    ) {
      recordChange(
        changes,
        "endDate",
        currentEndDate?.toISOString(),
        nextEndDate.toISOString(),
      );
      payload.endDate = nextEndDate;
    }
  }

  if (event.type === EVENT_TYPES.QUOTE) {
    if (output.quote !== null && payload.quote !== output.quote) {
      recordChange(changes, "quote", payload.quote, output.quote);
      payload.quote = output.quote;
    }
    if (output.details !== null && payload.details !== output.details) {
      recordChange(changes, "details", payload.details, output.details);
      payload.details = toStringValue(output.details);
    }
  }

  if (event.type === EVENT_TYPES.TRANSACTION) {
    if (output.total !== null && payload.total !== output.total) {
      recordChange(changes, "total", payload.total, output.total);
      payload.total = output.total;
    }
    if (output.currency !== null && payload.currency !== output.currency) {
      recordChange(changes, "currency", payload.currency, output.currency);
      payload.currency = output.currency;
    }
  }

  return { ...event, payload } as Event;
};

/**
 * Merges an event-enrich agent extraction into an existing event.
 *
 * - Scalars overwrite only keys that belong to the event type's payload.
 * - The excerpt goes through `toInitialValue` (plain text -> BlockNoteDocument).
 * - Relations are additive: unions of the existing ids, deduplicated. Nothing
 *   is ever removed. `keywords` applies to all types; `actors`/`groups` only
 *   to Uncategorized payload relations (role fields of other types such as
 *   victim/from/to/authors/owners/subjects are left untouched).
 * - `draft`, `links`, `media`, `id` and `type` are never changed.
 * - The returned object carries a `report` (`missing` + `changes`) alongside
 *   the event fields; the `Event` decode ignores it.
 */
export const mergeEventExtraction = (
  event: Event,
  output: UpdateEventAgentOutput,
): MergeEventExtractionResult => {
  const changes: UpdateEventAgentOutputChange[] = [];

  let merged = applyScalars(event, output, changes);

  const keywords = unionUUIDs(event.keywords ?? [], output.keywords);
  if (keywords.length !== (event.keywords ?? []).length) {
    recordChange(changes, "keywords", undefined, keywords.join(","));
  }
  merged = { ...merged, keywords };

  if (event.type === EVENT_TYPES.UNCATEGORIZED) {
    const payload = merged.payload as {
      actors: readonly UUID[];
      groups: readonly UUID[];
    };
    const actors = unionUUIDs(payload.actors, output.actors);
    const groups = unionUUIDs(payload.groups, output.groups);
    if (actors.length !== (payload.actors ?? []).length) {
      recordChange(changes, "actors", undefined, actors.join(","));
    }
    if (groups.length !== (payload.groups ?? []).length) {
      recordChange(changes, "groups", undefined, groups.join(","));
    }
    merged = {
      ...merged,
      payload: {
        ...(merged.payload as UncategorizedV2Payload),
        actors,
        groups,
      },
    } as Event;
  }

  return {
    ...merged,
    report: { missing: output.missing, changes },
  };
};

export const MergeEventExtractionHelper = {
  mergeEventExtraction,
  unionUUIDs,
  toStringValue,
};
