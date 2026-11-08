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
import { type UUID } from "@liexp/io/lib/http/Common/index.js";
import type * as Events from "@liexp/io/lib/http/Events/index.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { defineMcpTool } from "./helpers.js";
import type { ServerContext } from "#context/context.type.js";

const eventToOutput = (event: Events.Event): Record<string, unknown> => ({
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
      const { query, actors, groups, type, startDate, endDate, start, end } =
        input;

      const typeFilter = pipe(
        O.fromNullable(type),
        O.map((t) => [t] as const),
      );

      const actorsFilter = pipe(
        O.fromNullable(actors),
        O.filter((a) => a.length > 0),
      );

      const groupsFilter = pipe(
        O.fromNullable(groups),
        O.filter((g) => g.length > 0),
      );

      const startDateFilter = O.fromNullable(startDate);

      const endDateFilter = O.fromNullable(endDate);

      const skip = Number(start ?? 0);
      const take = Number(end ?? 20);

      try {
        const te = searchEventV2Query({
          q: pipe(
            O.fromNullable(query),
            O.filter((q) => q.length > 0),
          ),
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
            events: output.results.map((e) =>
              eventToOutput(e as unknown as Events.Event),
            ),
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
      type: Schema.Union(
        Schema.Literal("Uncategorized"),
        Schema.Literal("Death"),
        Schema.Literal("Quote"),
        Schema.Literal("Transaction"),
        Schema.Literal("ScientificStudy"),
        Schema.Literal("Book"),
        Schema.Literal("Patent"),
        Schema.Literal("Documentary"),
      ).annotations({
        description:
          "Event type: Death, ScientificStudy, Patent, Documentary, Transaction, Book, Quote, Uncategorized",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description: "Short excerpt or summary",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full body content",
      }),
      date: Schema.UndefinedOr(Schema.String).annotations({
        description: "Event date in ISO 8601 format (YYYY-MM-DD)",
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
      // Documentary-specific fields
      title: Schema.UndefinedOr(Schema.String).annotations({
        description: "Title (for Documentary, Patent, ScientificStudy)",
      }),
      description: Schema.UndefinedOr(Schema.String).annotations({
        description: "Description (for Documentary, Patent, ScientificStudy)",
      }),
      summary: Schema.UndefinedOr(Schema.String).annotations({
        description: "Summary (for Documentary, Patent, ScientificStudy)",
      }),
      image: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Image/media UUID (for Documentary, Patent, ScientificStudy)",
      }),
      // Documentary-specific
      documentaryMedia: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description: "Documentary media UUIDs (for Documentary type)",
      }),
      website: Schema.UndefinedOr(Schema.String).annotations({
        description: "Website URL (for Documentary type)",
      }),
      authorActors: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations(
        {
          description: "Author actor UUIDs (for Documentary type)",
        },
      ),
      authorGroups: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations(
        {
          description: "Author group UUIDs (for Documentary type)",
        },
      ),
      subjectActors: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description: "Subject actor UUIDs (for Documentary type)",
      }),
      subjectGroups: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description: "Subject group UUIDs (for Documentary type)",
      }),
      // Book-specific
      publisher: Schema.UndefinedOr(Schema.String).annotations({
        description: "Publisher name (for Book type)",
      }),
      authors: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Author names (for Book type)",
      }),
      pdf: Schema.UndefinedOr(Schema.String).annotations({
        description: "PDF URL (for Book type)",
      }),
      audio: Schema.UndefinedOr(Schema.String).annotations({
        description: "Audio URL (for Book type)",
      }),
      // Patent-specific
      publicationDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Publication date (for Patent type)",
      }),
      patentNumber: Schema.UndefinedOr(Schema.String).annotations({
        description: "Patent number (for Patent type)",
      }),
      applicant: Schema.UndefinedOr(Schema.String).annotations({
        description: "Applicant name (for Patent type)",
      }),
      ownerActors: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Owner actor UUIDs (for Patent type)",
      }),
      ownerGroups: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Owner group UUIDs (for Patent type)",
      }),
      // Transaction-specific
      amount: Schema.UndefinedOr(Schema.String).annotations({
        description: "Transaction amount (for Transaction type)",
      }),
      currency: Schema.UndefinedOr(Schema.String).annotations({
        description: "Currency code (for Transaction type)",
      }),
      source: Schema.UndefinedOr(Schema.String).annotations({
        description: "Source (for Transaction type)",
      }),
    }),
    async (input) => {
      try {
        // Build type-specific payload fields first
        const payload: Record<string, unknown> = {};

        // Documentary fields
        if (input.title !== undefined) payload.title = input.title;
        if (input.description !== undefined)
          payload.description = input.description;
        if (input.summary !== undefined) payload.summary = input.summary;
        if (input.image !== undefined) payload.image = input.image;
        if (input.documentaryMedia !== undefined)
          payload.documentaryMedia = input.documentaryMedia;
        if (input.website !== undefined) payload.website = input.website;
        if (input.authorActors !== undefined)
          payload.authorActors = input.authorActors;
        if (input.authorGroups !== undefined)
          payload.authorGroups = input.authorGroups;
        if (input.subjectActors !== undefined)
          payload.subjectActors = input.subjectActors;
        if (input.subjectGroups !== undefined)
          payload.subjectGroups = input.subjectGroups;

        // Book fields
        if (input.publisher !== undefined) payload.publisher = input.publisher;
        if (input.authors !== undefined) payload.authors = input.authors;
        if (input.pdf !== undefined) payload.pdf = input.pdf;
        if (input.audio !== undefined) payload.audio = input.audio;

        // Patent fields
        if (input.publicationDate !== undefined)
          payload.publicationDate = input.publicationDate;
        if (input.patentNumber !== undefined)
          payload.patentNumber = input.patentNumber;
        if (input.applicant !== undefined) payload.applicant = input.applicant;
        if (input.ownerActors !== undefined)
          payload.ownerActors = input.ownerActors;
        if (input.ownerGroups !== undefined)
          payload.ownerGroups = input.ownerGroups;

        // Transaction fields
        if (input.amount !== undefined) payload.amount = input.amount;
        if (input.currency !== undefined) payload.currency = input.currency;
        if (input.source !== undefined) payload.source = input.source;

        // Build the event body based on type
        // Cast to CreateEventPlainBody since TypeScript can't narrow the union
        const baseBody: Events.CreateEventPlainBody = {
          type: input.type as Events.EventType,
          excerpt: input.excerpt ?? undefined,
          body: input.body ?? undefined,
          date: input.date ? new Date(input.date) : undefined,
          draft: input.draft ?? false,
          links: input.links ?? [],
          media: input.media ?? [],
          keywords: input.keywords ?? [],
          payload,
        } as Events.CreateEventPlainBody;

        const te = createEventQuery(baseBody)(ctx);
        const result = await pipe(
          te,
          fp.TE.chain((event) =>
            ctx.db.findOneOrFail(EventV2Entity, {
              where: { id: event.id as UUID },
              relations: { media: true, links: true, keywords: true },
            }),
          ),
          fp.TE.map((event) => ({
            event: eventToOutput(event as unknown as Events.Event),
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
        "Create a new event of any type (Uncategorized, Death, Quote, Transaction, ScientificStudy, Book, Patent, Documentary).",
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
      type: Schema.UndefinedOr(
        Schema.Union(
          Schema.Literal("Uncategorized"),
          Schema.Literal("Death"),
          Schema.Literal("Quote"),
          Schema.Literal("Transaction"),
          Schema.Literal("ScientificStudy"),
          Schema.Literal("Book"),
          Schema.Literal("Patent"),
          Schema.Literal("Documentary"),
        ),
      ).annotations({
        description: "New event type",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description: "New excerpt",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description: "New body content",
      }),
      date: Schema.UndefinedOr(Schema.String).annotations({
        description: "New date in ISO 8601 format (YYYY-MM-DD)",
      }),
      draft: Schema.UndefinedOr(Schema.Boolean).annotations({
        description: "New draft status",
      }),
      links: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New related link UUIDs",
      }),
      media: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New media UUIDs",
      }),
      keywords: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New keyword UUIDs",
      }),
      // Documentary-specific fields
      title: Schema.UndefinedOr(Schema.String).annotations({
        description: "New title (for Documentary, Patent, ScientificStudy)",
      }),
      description: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "New description (for Documentary, Patent, ScientificStudy)",
      }),
      summary: Schema.UndefinedOr(Schema.String).annotations({
        description: "New summary (for Documentary, Patent, ScientificStudy)",
      }),
      image: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "New image/media UUID (for Documentary, Patent, ScientificStudy)",
      }),
      documentaryMedia: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description: "New documentary media UUIDs (for Documentary type)",
      }),
      website: Schema.UndefinedOr(Schema.String).annotations({
        description: "New website URL (for Documentary type)",
      }),
      authorActors: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations(
        {
          description: "New author actor UUIDs (for Documentary type)",
        },
      ),
      authorGroups: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations(
        {
          description: "New author group UUIDs (for Documentary type)",
        },
      ),
      subjectActors: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description: "New subject actor UUIDs (for Documentary type)",
      }),
      subjectGroups: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description: "New subject group UUIDs (for Documentary type)",
      }),
      publisher: Schema.UndefinedOr(Schema.String).annotations({
        description: "New publisher name (for Book type)",
      }),
      authors: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New author names (for Book type)",
      }),
      pdf: Schema.UndefinedOr(Schema.String).annotations({
        description: "New PDF URL (for Book type)",
      }),
      audio: Schema.UndefinedOr(Schema.String).annotations({
        description: "New audio URL (for Book type)",
      }),
      publicationDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "New publication date (for Patent type)",
      }),
      patentNumber: Schema.UndefinedOr(Schema.String).annotations({
        description: "New patent number (for Patent type)",
      }),
      applicant: Schema.UndefinedOr(Schema.String).annotations({
        description: "New applicant name (for Patent type)",
      }),
      ownerActors: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New owner actor UUIDs (for Patent type)",
      }),
      ownerGroups: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New owner group UUIDs (for Patent type)",
      }),
      amount: Schema.UndefinedOr(Schema.String).annotations({
        description: "New transaction amount (for Transaction type)",
      }),
      currency: Schema.UndefinedOr(Schema.String).annotations({
        description: "New currency code (for Transaction type)",
      }),
      source: Schema.UndefinedOr(Schema.String).annotations({
        description: "New source (for Transaction type)",
      }),
    }),
    async (input) => {
      try {
        // Find the existing event
        const foundEither = await ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: input.id },
          relations: { media: true, links: true, keywords: true },
        })();

        if (fp.E.isLeft(foundEither)) {
          throw new Error(`Event not found: ${input.id}`);
        }

        const storedEvent = foundEither.right;

        // Build type-specific payload updates
        const payloadUpdates: Record<string, unknown> = {};
        if (input.title !== undefined) payloadUpdates.title = input.title;
        if (input.description !== undefined)
          payloadUpdates.description = input.description;
        if (input.summary !== undefined) payloadUpdates.summary = input.summary;
        if (input.image !== undefined) payloadUpdates.image = input.image;
        if (input.documentaryMedia !== undefined)
          payloadUpdates.documentaryMedia = input.documentaryMedia;
        if (input.website !== undefined) payloadUpdates.website = input.website;
        if (input.authorActors !== undefined)
          payloadUpdates.authorActors = input.authorActors;
        if (input.authorGroups !== undefined)
          payloadUpdates.authorGroups = input.authorGroups;
        if (input.subjectActors !== undefined)
          payloadUpdates.subjectActors = input.subjectActors;
        if (input.subjectGroups !== undefined)
          payloadUpdates.subjectGroups = input.subjectGroups;
        if (input.publisher !== undefined)
          payloadUpdates.publisher = input.publisher;
        if (input.authors !== undefined) payloadUpdates.authors = input.authors;
        if (input.pdf !== undefined) payloadUpdates.pdf = input.pdf;
        if (input.audio !== undefined) payloadUpdates.audio = input.audio;
        if (input.publicationDate !== undefined)
          payloadUpdates.publicationDate = input.publicationDate;
        if (input.patentNumber !== undefined)
          payloadUpdates.patentNumber = input.patentNumber;
        if (input.applicant !== undefined)
          payloadUpdates.applicant = input.applicant;
        if (input.ownerActors !== undefined)
          payloadUpdates.ownerActors = input.ownerActors;
        if (input.ownerGroups !== undefined)
          payloadUpdates.ownerGroups = input.ownerGroups;
        if (input.amount !== undefined) payloadUpdates.amount = input.amount;
        if (input.currency !== undefined)
          payloadUpdates.currency = input.currency;
        if (input.source !== undefined) payloadUpdates.source = input.source;

        // Merge with stored payload
        const unwrappedPayload: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(payloadUpdates)) {
          if (value !== undefined) {
            unwrappedPayload[key] = value;
          }
        }

        const mergedPayload = {
          ...storedEvent.payload,
          ...unwrappedPayload,
        };

        // Build EditEventBody - type is narrowed by switch in editEventQuery
        // Cast to EditEventBody since TypeScript can't narrow the union
        const editBody: Events.EditEventBody = {
          type: (input.type ?? storedEvent.type) as Events.EventType,
          body: O.fromNullable(input.body),
          excerpt: O.fromNullable(input.excerpt),
          date: input.date
            ? O.some(new Date(input.date))
            : (O.none as unknown as O.Option<Date>),
          draft:
            input.draft !== undefined
              ? O.some(input.draft)
              : (O.none as unknown as O.Option<boolean>),
          payload: mergedPayload as Record<string, unknown>,
          links:
            input.links !== undefined ? O.fromNullable(input.links) : undefined,
          media:
            input.media !== undefined ? O.fromNullable(input.media) : undefined,
          keywords:
            input.keywords !== undefined
              ? O.fromNullable(input.keywords)
              : undefined,
        } as Events.EditEventBody;

        // Execute the edit event query
        const editTE = editEventQuery(storedEvent, editBody)(ctx);
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
                event: eventToOutput(editedResult.right as Events.Event),
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
        "Edit an existing event in the database. Provide the event ID and fields to update.",
      annotations: { title: "Edit event", destructiveHint: true },
      inputSchema: editEventTool.inputSchema,
    },
    editEventTool.handler,
  );
};
