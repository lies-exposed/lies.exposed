import { randomUUID } from "node:crypto";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import {
  FIND_EVENTS,
  CREATE_EVENT,
  EDIT_EVENT,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { createEventQuery } from "@liexp/backend/lib/queries/events/createEvent.query.js";
import { editEventQuery } from "@liexp/backend/lib/queries/events/editEvent.query.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  BlockNoteDocument,
  type BlockNoteDocument as BlockNoteDoc,
} from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import type { UUID } from "@liexp/io/lib/http/Common/index.js";
import type * as Events from "@liexp/io/lib/http/Events/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import {
  buildCreatePayload,
  buildEditPayload,
  EventTypeFieldsSchema,
  EventTypeSchema,
} from "./eventPayload.js";
import { asFlowInput, defineMcpTool } from "./helpers.js";
import type { ServerContext } from "#context/context.type.js";

const decodeBlockNote = Schema.decodeUnknownSync(BlockNoteDocument);

const eventToOutput = (event: EventV2Entity): Record<string, unknown> => ({
  id: event.id,
  type: event.type,
  date: event.date,
  draft: event.draft ?? false,
  excerpt: event.excerpt ?? undefined,
  body: event.body ?? undefined,
  payload: event.payload ?? {},
  links: (event.links as readonly (string | { id: string })[]).map((l) =>
    typeof l === "string" ? l : l.id,
  ),
  media: (event.media as readonly (string | { id: string })[]).map((m) =>
    typeof m === "string" ? m : m.id,
  ),
  keywords: (event.keywords as readonly (string | { id: string })[]).map((k) =>
    typeof k === "string" ? k : k.id,
  ),
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
});

export const registerEventsTools = (server: McpServer, ctx: ServerContext) => {
  // --- findEvents ---
  const findEventsTool = defineMcpTool(
    Schema.Struct({
      query: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full-text search query",
      }),
      ids: Schema.optional(Schema.Array(Schema.String)).annotations({
        description:
          "Fetch specific events by UUID (use this to get a record by id)",
      }),
      actors: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Filter by actor UUIDs",
      }),
      groups: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Filter by group UUIDs",
      }),
      type: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Filter by event type: Death, ScientificStudy, Patent, Documentary, Transaction, Book, Quote, Uncategorized",
      }),
      startDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Filter events on or after this date (YYYY-MM-DD)",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Filter events on or before this date (YYYY-MM-DD)",
      }),
      start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Pagination offset (default: 0)",
      }),
      end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Pagination limit (default: 20)",
      }),
    }),
    async (input) => {
      const {
        query,
        ids,
        actors,
        groups,
        type,
        startDate,
        endDate,
        start,
        end,
      } = input;

      const idsFilter = pipe(
        O.fromNullable(ids),
        O.filter((i) => i.length > 0),
      );

      const typeFilter = pipe(
        O.fromNullable(type),
        O.map((t) => [t as Events.EventType]),
      );

      const actorsFilter = pipe(
        O.fromNullable(actors),
        O.filter((a) => a.length > 0),
        O.map((a) => a as readonly UUID[]),
      );

      const groupsFilter = pipe(
        O.fromNullable(groups),
        O.filter((g) => g.length > 0),
        O.map((g) => g as readonly UUID[]),
      );

      const startDateFilter = pipe(
        O.fromNullable(startDate),
        O.map((d) => new Date(d)),
      );

      const endDateFilter = pipe(
        O.fromNullable(endDate),
        O.map((d) => new Date(d)),
      );

      const skip = Number(start ?? 0);
      const take = Number(end ?? 20);

      try {
        const te = searchEventV2Query({
          q: pipe(
            O.fromNullable(query),
            O.filter((q) => q.length > 0),
          ),
          ids: idsFilter,
          actors: actorsFilter,
          groupsMembers: groupsFilter,
          type: typeFilter,
          startDate: startDateFilter,
          endDate: endDateFilter,
          skip,
          take,
          order: { date: "ASC" as const },
        })(ctx);

        const result = await pipe(
          te,
          fp.TE.map((output) => ({
            events: output.results.map((e) => eventToOutput(e)),
            total: output.total,
            totals: output.totals,
            firstDate: output.firstDate,
            lastDate: output.lastDate,
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find events",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(result.right),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("findEvents error: %O", err);
        throw new Error(
          `Failed to find events: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    FIND_EVENTS,
    {
      title: "Find events",
      description:
        "Search and list events in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find events" },
      inputSchema: findEventsTool.inputSchema,
    },
    findEventsTool.handler,
  );

  // --- createEvent ---
  const createEventTool = defineMcpTool(
    Schema.Struct({
      type: EventTypeSchema.annotations({
        description:
          "Event type: Uncategorized, Death, Quote, Transaction, ScientificStudy, Book, Patent, Documentary",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Short excerpt as plain text (one paragraph per line; stored as a BlockNote document)",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Full body as plain text (one paragraph per line; stored as a BlockNote document)",
      }),
      date: Schema.String.annotations({
        description: "Event date in ISO 8601 format (YYYY-MM-DD) (required)",
      }),
      draft: Schema.UndefinedOr(Schema.Boolean).annotations({
        description: "Whether the event is a draft (default: false)",
      }),
      links: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Array of related link UUIDs",
      }),
      media: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Array of media UUIDs",
      }),
      keywords: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Array of keyword UUIDs",
      }),
      ...EventTypeFieldsSchema.fields,
    }),
    async (input) => {
      try {
        const payload = buildCreatePayload(input.type, input);

        const baseBody = {
          type: input.type,
          excerpt: input.excerpt ? toInitialValue(input.excerpt) : undefined,
          body: input.body ? toInitialValue(input.body) : undefined,
          date: new Date(input.date),
          draft: input.draft ?? false,
          links: input.links ?? [],
          media: input.media ?? [],
          keywords: input.keywords ?? [],
          payload,
        };

        const te = createEventQuery(asFlowInput<Events.CreateEventPlainBody>(baseBody))(ctx);

        const result = await pipe(
          te,
          // createEventQuery only builds the entity: persist it first
          fp.TE.chain((data) => ctx.db.save(EventV2Entity, [data])),
          fp.TE.chain(([event]) =>
            ctx.db.findOneOrFail(EventV2Entity, {
              where: { id: event.id },
              relations: { media: true, links: true, keywords: true },
            }),
          ),
          fp.TE.map((event) => ({
            event: eventToOutput(event),
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create event",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(result.right),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("createEvent error: %O", err);
        throw new Error(
          `Failed to create event: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    CREATE_EVENT,
    {
      title: "Create event",
      description:
        "Create a new event of any type (Uncategorized, Death, Quote, Transaction, ScientificStudy, Book, Patent, Documentary). Set `type`, the common fields and ONLY the type-specific fields listed for that type in each field description.",
      annotations: { title: "Create event", destructiveHint: true },
      inputSchema: createEventTool.inputSchema,
    },
    createEventTool.handler,
  );

  // --- editEvent ---
  const editEventTool = defineMcpTool(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "ID of the event to edit (required)",
      }),
      type: Schema.UndefinedOr(EventTypeSchema).annotations({
        description:
          "New event type (omit to keep the current one; type-specific fields apply to the resulting type)",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description: "New excerpt as plain text",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description: "New body as plain text",
      }),
      date: Schema.UndefinedOr(Schema.String).annotations({
        description: "New date in ISO 8601 format (YYYY-MM-DD)",
      }),
      draft: Schema.UndefinedOr(Schema.Boolean).annotations({
        description: "New draft status",
      }),
      links: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New related link UUIDs (replaces the current list)",
      }),
      media: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New media UUIDs (replaces the current list)",
      }),
      keywords: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New keyword UUIDs (replaces the current list)",
      }),
      ...EventTypeFieldsSchema.fields,
    }),
    async (input) => {
      try {
        // Find the existing event
        const foundEither = await ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: input.id as UUID },
          relations: { media: true, links: true, keywords: true },
        })();

        if (fp.E.isLeft(foundEither)) {
          throw new Error(`Event not found: ${input.id}`);
        }

        const storedEvent = foundEither.right;
        const type = input.type ?? storedEvent.type;

        // editEventQuery merges these over the stored payload
        const payload = buildEditPayload(type, input, storedEvent.payload);

        const editBody = {
          type,
          body: input.body ? O.some(toInitialValue(input.body)) : O.none(),
          excerpt: input.excerpt
            ? O.some(toInitialValue(input.excerpt))
            : O.none(),
          date: input.date ? O.some(new Date(input.date)) : O.none(),
          draft: input.draft !== undefined ? O.some(input.draft) : O.none(),
          payload,
          links: O.fromNullable(input.links),
          media: O.fromNullable(input.media),
          keywords: O.fromNullable(input.keywords),
        };

        // The union member is narrowed by `type` at runtime in editEventQuery
        const flowEditBody = asFlowInput<Events.EditEventBody>(editBody);

        // Execute the edit event query
        const editTE = editEventQuery(storedEvent, flowEditBody)(ctx);
        const editedResult = await pipe(
          editTE,
          fp.TE.chain((edited) => ctx.db.save(EventV2Entity, [edited])),
          fp.TE.chain(([event]) =>
            ctx.db.findOneOrFail(EventV2Entity, {
              where: { id: event.id },
              relations: { media: true, links: true, keywords: true },
            }),
          ),
        )();

        if (fp.E.isLeft(editedResult)) {
          throw new Error("Failed to edit event");
        }

        return {
          content: [
            {
              text: JSON.stringify({
                event: eventToOutput(editedResult.right),
              }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("editEvent error: %O", err);
        throw new Error(
          `Failed to edit event: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    EDIT_EVENT,
    {
      title: "Edit event",
      description:
        "Edit an existing event. Provide the event ID and only the fields to change; type-specific fields are merged into the existing payload.",
      annotations: { title: "Edit event", destructiveHint: true },
      inputSchema: editEventTool.inputSchema,
    },
    editEventTool.handler,
  );
};
