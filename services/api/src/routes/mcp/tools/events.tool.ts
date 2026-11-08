import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import {
  FIND_EVENTS,
  CREATE_EVENT,
  EDIT_EVENT,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { createEventQuery } from "@liexp/backend/lib/queries/events/createEvent.query.js";
import { editEventQuery } from "@liexp/backend/lib/queries/events/editEvent.query.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import type * as Events from "@liexp/io/lib/http/Events/index.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { Equal } from "typeorm";
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
  const findEventsInputSchema = effectToZodStruct(
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
  );

  server.registerTool(
    FIND_EVENTS,
    {
      title: "Find events",
      description:
        "Search and list events in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find events" },
      inputSchema: findEventsInputSchema,
    },
    async (opts) => {
      const { query, actors, groups, type, startDate, endDate, start, end } =
        opts ?? {};

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any)(ctx);

        const result = await pipe(
          te,
          fp.TE.map((output) => ({
            events: output.results.map((e) =>
              pipe(
                e,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (ev: any) => eventToOutput(ev as Events.Event),
              ),
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

  // --- createEvent ---
  const createEventInputSchema = effectToZodStruct(
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
          "Event type (required): Uncategorized | Death | Quote | Transaction | ScientificStudy | Book | Patent | Documentary",
      }),
      date: Schema.String.annotations({
        description: "Event date (required) YYYY-MM-DD",
      }),
      draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
        description: "Draft flag (default: false)",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description: "Short excerpt text as plain text",
      }),
      links: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated link UUIDs",
      }),
      media: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated media UUIDs",
      }),
      keywords: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated keyword UUIDs",
      }),
      // Uncategorized / Death / Quote / etc. payloads
      title: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Event title (required for Uncategorized, Transaction, ScientificStudy, Book, Patent, Documentary)",
      }),
      actors: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated actor UUIDs (Uncategorized payload)",
      }),
      groups: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated group UUIDs (Uncategorized payload)",
      }),
      groupsMembers: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description:
          "Comma-separated group-member UUIDs (Uncategorized payload)",
      }),
      location: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Area UUID for event location (Uncategorized/Death payload)",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "End date YYYY-MM-DD (Uncategorized payload)",
      }),
      // Death payload
      victim: Schema.UndefinedOr(Schema.String).annotations({
        description: "Actor UUID of the victim (Death payload, required)",
      }),
      // Quote payload
      actor: Schema.UndefinedOr(Schema.String).annotations({
        description: "Actor UUID who made the quote (Quote payload)",
      }),
      quote: Schema.UndefinedOr(Schema.String).annotations({
        description: "Quote text (Quote payload)",
      }),
      details: Schema.UndefinedOr(Schema.String).annotations({
        description: "Additional details (Quote payload)",
      }),
      // Transaction payload
      total: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Transaction total amount (Transaction payload)",
      }),
      currency: Schema.UndefinedOr(Schema.String).annotations({
        description: "Currency code e.g. USD (Transaction payload)",
      }),
      fromType: Schema.UndefinedOr(Schema.String).annotations({
        description: "Sender subject type: actor | group (Transaction payload)",
      }),
      fromId: Schema.UndefinedOr(Schema.String).annotations({
        description: "Sender subject UUID (Transaction payload)",
      }),
      toType: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Recipient subject type: actor | group (Transaction payload)",
      }),
      toId: Schema.UndefinedOr(Schema.String).annotations({
        description: "Recipient subject UUID (Transaction payload)",
      }),
      // ScientificStudy payload
      studyUrl: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Link UUID for the study URL (ScientificStudy payload, required)",
      }),
      image: Schema.UndefinedOr(Schema.String).annotations({
        description: "Media UUID for the study image (ScientificStudy payload)",
      }),
      publisher: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Actor UUID of the publisher (ScientificStudy/Book payload)",
      }),
      authors: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated actor UUIDs of authors",
      }),
      pdf: Schema.UndefinedOr(Schema.String).annotations({
        description: "Media UUID for the PDF (Book payload)",
      }),
      audio: Schema.UndefinedOr(Schema.String).annotations({
        description: "Media UUID for audio (Book payload)",
      }),
      ownerActors: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated actor UUIDs as patent owners",
      }),
      ownerGroups: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated group UUIDs as patent owners",
      }),
      source: Schema.UndefinedOr(Schema.String).annotations({
        description: "Link UUID as patent source",
      }),
      documentaryMedia: Schema.UndefinedOr(Schema.String).annotations({
        description: "Media UUID for the documentary",
      }),
      website: Schema.UndefinedOr(Schema.String).annotations({
        description: "Link UUID for the documentary website",
      }),
      authorActors: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated actor UUIDs as documentary authors",
      }),
      authorGroups: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated group UUIDs as documentary authors",
      }),
      subjectActors: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated actor UUIDs as documentary subjects",
      }),
      subjectGroups: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated group UUIDs as documentary subjects",
      }),
    }),
  );

  server.registerTool(
    CREATE_EVENT,
    {
      title: "Create event",
      description:
        "Create a new event of any type (Uncategorized, Death, Quote, Transaction, ScientificStudy, Book, Patent, Documentary).",
      annotations: { title: "Create event" },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: createEventInputSchema as unknown as Record<string, any>,
    },
    async (opts) => {
      const input = opts ?? {};
      const { type, date } = input;
      if (!type || !date) {
        throw new Error("type and date are required");
      }

      try {
        // Build the payload based on event type
        const buildPayload = (): Record<string, unknown> => {
          switch (type) {
            case EVENT_TYPES.DEATH: {
              const { _location, _endDate, ...rest } = input as Record<
                string,
                unknown
              >;
              return {
                victim: input.victim,
                location: input.location,
                ...rest,
              };
            }
            case EVENT_TYPES.QUOTE: {
              const { _location, _endDate, _victim, ...rest } = input as Record<
                string,
                unknown
              >;
              return {
                actor: input.actor,
                quote: input.quote,
                details: input.details,
                ...rest,
              };
            }
            case EVENT_TYPES.TRANSACTION: {
              const {
                _location,
                _endDate,
                _victim,
                _actor,
                _quote,
                _details,
                ...rest
              } = input as Record<string, unknown>;
              return {
                total: input.total,
                currency: input.currency,
                fromType: input.fromType,
                fromId: input.fromId,
                toType: input.toType,
                toId: input.toId,
                ...rest,
              };
            }
            case EVENT_TYPES.SCIENTIFIC_STUDY: {
              const {
                _location,
                _endDate,
                _victim,
                _actor,
                _quote,
                _details,
                _total,
                _currency,
                _fromType,
                _fromId,
                _toType,
                _toId,
                ...rest
              } = input as Record<string, unknown>;
              return {
                title: input.title,
                url: input.studyUrl,
                image: input.image,
                publisher: input.publisher,
                authors: input.authors,
                ...rest,
              };
            }
            case EVENT_TYPES.BOOK: {
              const {
                _location,
                _endDate,
                _victim,
                _actor,
                _quote,
                _details,
                _total,
                _currency,
                _fromType,
                _fromId,
                _toType,
                _toId,
                _studyUrl,
                _image,
                _publisher,
                _authors,
                ...rest
              } = input as Record<string, unknown>;
              return {
                title: input.title,
                pdf: input.pdf,
                audio: input.audio,
                authors: input.authors,
                publisher: input.publisher,
                ...rest,
              };
            }
            case EVENT_TYPES.PATENT: {
              const {
                _location,
                _endDate,
                _victim,
                _actor,
                _quote,
                _details,
                _total,
                _currency,
                _fromType,
                _fromId,
                _toType,
                _toId,
                _studyUrl,
                _image,
                _publisher,
                _authors,
                _pdf,
                _audio,
                ...rest
              } = input as Record<string, unknown>;
              return {
                title: input.title,
                ownerActors: input.ownerActors,
                ownerGroups: input.ownerGroups,
                source: input.source,
                ...rest,
              };
            }
            case EVENT_TYPES.DOCUMENTARY: {
              const {
                _location,
                _endDate,
                _victim,
                _actor,
                _quote,
                _details,
                _total,
                _currency,
                _fromType,
                _fromId,
                _toType,
                _toId,
                _studyUrl,
                _image,
                _publisher,
                _authors,
                _pdf,
                _audio,
                _ownerActors,
                _ownerGroups,
                _source,
                ...rest
              } = input as Record<string, unknown>;
              return {
                title: input.title,
                media: input.documentaryMedia,
                website: input.website,
                authorActors: input.authorActors,
                authorGroups: input.authorGroups,
                subjectActors: input.subjectActors,
                subjectGroups: input.subjectGroups,
                ...rest,
              };
            }
            case EVENT_TYPES.UNCATEGORIZED:
            default: {
              const {
                _victim,
                _actor,
                _quote,
                _details,
                _total,
                _currency,
                _fromType,
                _fromId,
                _toType,
                _toId,
                _studyUrl,
                _image,
                _publisher,
                _authors,
                _pdf,
                _audio,
                _ownerActors,
                _ownerGroups,
                _source,
                _documentaryMedia,
                _website,
                _authorActors,
                _authorGroups,
                _subjectActors,
                _subjectGroups,
                ...rest
              } = input as Record<string, unknown>;
              return {
                title: input.title,
                actors: input.actors,
                groups: input.groups,
                groupsMembers: input.groupsMembers,
                location: input.location,
                endDate: input.endDate,
                ...rest,
              };
            }
          }
        };

        // Build the CreateEventPlainBody
        const createBody: Events.CreateEventPlainBody = {
          type,
          date: new Date(date),
          draft: input.draft ?? false,
          body: input.body ?? undefined,
          excerpt: input.excerpt ?? undefined,
          links: input.links ?? [],
          media: input.media ?? [],
          keywords: input.keywords ?? [],
          payload: buildPayload() as any,
        };

        // Execute the create event query
        const te = createEventQuery(createBody)(ctx);
        const result = await pipe(
          te,
          fp.TE.chain((data) => ctx.db.save(EventV2Entity, [data])),
          fp.TE.chain(([event]) =>
            ctx.db.findOneOrFail(EventV2Entity, {
              where: { id: Equal(event.id) },
              relations: { media: true, links: true, keywords: true },
            }),
          ),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error("Failed to create event");
        }

        return {
          content: [
            {
              text: JSON.stringify({
                event: eventToOutput(result.right as Events.Event),
              }),
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

  // --- editEvent ---
  const editEventInputSchema = effectToZodStruct(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "UUID of the event to edit (required)",
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
        description:
          "Event type (optional, for type change): Uncategorized | Death | Quote | Transaction | ScientificStudy | Book | Patent | Documentary",
      }),
      date: Schema.UndefinedOr(Schema.String).annotations({
        description: "Event date YYYY-MM-DD",
      }),
      draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
        description: "Draft flag",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description: "Short excerpt text as plain text",
      }),
      links: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated link UUIDs",
      }),
      media: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated media UUIDs",
      }),
      keywords: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated keyword UUIDs",
      }),
      // All payload fields (same as create, all optional for partial update)
      title: Schema.UndefinedOr(Schema.String).annotations({
        description: "Event title",
      }),
      actors: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated actor UUIDs",
      }),
      groups: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Comma-separated group UUIDs",
      }),
      groupsMembers: Schema.UndefinedOr(
        Schema.Array(Schema.String),
      ).annotations({
        description: "Comma-separated group-member UUIDs",
      }),
      location: Schema.UndefinedOr(Schema.String).annotations({
        description: "Area UUID for event location",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "End date YYYY-MM-DD",
      }),
      victim: Schema.UndefinedOr(Schema.String).annotations({
        description: "Actor UUID of the victim",
      }),
      actor: Schema.UndefinedOr(Schema.String).annotations({
        description: "Actor UUID who made the quote",
      }),
      quote: Schema.UndefinedOr(Schema.String).annotations({
        description: "Quote text",
      }),
      details: Schema.UndefinedOr(Schema.String).annotations({
        description: "Additional details",
      }),
      total: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Transaction total amount",
      }),
      currency: Schema.UndefinedOr(Schema.String).annotations({
        description: "Currency code",
      }),
      fromType: Schema.UndefinedOr(Schema.String).annotations({
        description: "Sender subject type: actor | group",
      }),
      fromId: Schema.UndefinedOr(Schema.String).annotations({
        description: "Sender subject UUID",
      }),
      toType: Schema.UndefinedOr(Schema.String).annotations({
        description: "Recipient subject type: actor | group",
      }),
      toId: Schema.UndefinedOr(Schema.String).annotations({
        description: "Recipient subject UUID",
      }),
      studyUrl: Schema.UndefinedOr(Schema.String).annotations({
        description: "Link UUID for the study URL",
      }),
      image: Schema.UndefinedOr(Schema.String).annotations({
        description: "Media UUID",
      }),
      publisher: Schema.UndefinedOr(Schema.String).annotations({
        description: "Actor UUID of the publisher",
      }),
      authors: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated actor UUIDs of authors",
      }),
      pdf: Schema.UndefinedOr(Schema.String).annotations({
        description: "Media UUID for the PDF",
      }),
      audio: Schema.UndefinedOr(Schema.String).annotations({
        description: "Media UUID for audio",
      }),
      ownerActors: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated actor UUIDs as patent owners",
      }),
      ownerGroups: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated group UUIDs as patent owners",
      }),
      source: Schema.UndefinedOr(Schema.String).annotations({
        description: "Link UUID as patent source",
      }),
      documentaryMedia: Schema.UndefinedOr(Schema.String).annotations({
        description: "Media UUID for the documentary",
      }),
      website: Schema.UndefinedOr(Schema.String).annotations({
        description: "Link UUID for the documentary website",
      }),
      authorActors: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated actor UUIDs as documentary authors",
      }),
      authorGroups: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated group UUIDs as documentary authors",
      }),
      subjectActors: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated actor UUIDs as documentary subjects",
      }),
      subjectGroups: Schema.UndefinedOr(Schema.String).annotations({
        description: "Comma-separated group UUIDs as documentary subjects",
      }),
    }),
  );

  server.registerTool(
    EDIT_EVENT,
    {
      title: "Edit event",
      description:
        "Edit an existing event by ID. Supports partial updates for all event types.",
      annotations: { title: "Edit event" },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: editEventInputSchema as unknown as Record<string, any>,
    },
    async (opts) => {
      const input = opts ?? {};
      const { id } = input;
      if (!id) {
        throw new Error("id is required");
      }

      try {
        // Find the existing event
        const foundEither = await ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(id) },
          relations: { media: true, links: true, keywords: true },
        })();

        if (fp.E.isLeft(foundEither)) {
          throw new Error(`Event not found: ${id}`);
        }

        const storedEvent = foundEither.right;

        // Build the EditEventBody with Option-wrapped fields
        // Use foldOptionals to unwrap the payload like editEventQuery does
        const unwrappedPayload = foldOptionals({
          title: input.title,
          actors: input.actors,
          groups: input.groups,
          groupsMembers: input.groupsMembers,
          location: input.location,
          endDate: input.endDate,
          victim: input.victim,
          actor: input.actor,
          quote: input.quote,
          details: input.details,
          total: input.total,
          currency: input.currency,
          fromType: input.fromType,
          fromId: input.fromId,
          toType: input.toType,
          toId: input.toId,
          studyUrl: input.studyUrl,
          image: input.image,
          publisher: input.publisher,
          authors: input.authors,
          pdf: input.pdf,
          audio: input.audio,
          ownerActors: input.ownerActors,
          ownerGroups: input.ownerGroups,
          source: input.source,
          documentaryMedia: input.documentaryMedia,
          website: input.website,
          authorActors: input.authorActors,
          authorGroups: input.authorGroups,
          subjectActors: input.subjectActors,
          subjectGroups: input.subjectGroups,
        });

        const mergedPayload = {
          ...storedEvent.payload,
          ...unwrappedPayload,
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const editBody: any = {
          type: (input.type ?? storedEvent.type) as Events.EventType,
          body: O.fromNullable(input.excerpt),
          excerpt: O.fromNullable(input.excerpt),
          date: input.date
            ? O.some(new Date(input.date))
            : (O.none as unknown as O.Option<Date>),
          draft:
            input.draft !== undefined
              ? O.some(input.draft)
              : (O.none as unknown as O.Option<boolean>),
          payload: mergedPayload as any,
          links: O.fromNullable(input.links),
          media: O.fromNullable(input.media),
          keywords: O.fromNullable(input.keywords),
        };

        // Execute the edit event query
        const editTE = editEventQuery(storedEvent, editBody)(ctx);
        const editedResult = await pipe(
          editTE,
          fp.TE.chain((edited) => ctx.db.save(EventV2Entity, [edited])),
          fp.TE.chain(([event]) =>
            ctx.db.findOneOrFail(EventV2Entity, {
              where: { id: Equal(event.id) },
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
};
