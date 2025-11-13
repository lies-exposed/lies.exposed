import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import {
  CREATE_BOOK_EVENT,
  CREATE_PATENT_EVENT,
  CREATE_QUOTE_EVENT,
  CREATE_UNCATEGORIZED_EVENT,
  FIND_EVENTS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CreateBookBody } from "@liexp/shared/lib/io/http/Events/Book.js";
import {
  BOOK,
  EventType,
  PATENT,
  QUOTE,
  UNCATEGORIZED,
} from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type CreatePatentBody } from "@liexp/shared/lib/io/http/Events/Patent.js";
import { type CreateQuoteBody } from "@liexp/shared/lib/io/http/Events/Quote.js";
import { type CreateEventBody } from "@liexp/shared/lib/io/http/Events/Uncategorized.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { createEvent } from "../../../flows/events/createEvent.flow.js";
import { formatEventToMarkdown } from "./formatters/eventToMarkdown.formatter.js";

export const registerEventTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_EVENTS,
    {
      title: "Find events",
      description:
        "Search for events using various criteria like title, keywords, actor and group ids. Returns the story in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.UndefinedOr(Schema.String).annotations({
            description: "Search query string to filter events",
          }),
          actors: Schema.Array(UUID).annotations({
            description: "Array of actor UUIDs involved in the event",
          }),
          groups: Schema.Array(UUID).annotations({
            description: "Array of group UUIDs involved in the event",
          }),
          type: Schema.UndefinedOr(EventType).annotations({
            description: "Type of the event",
          }),
        }),
      ),
    },
    async ({ query, actors, groups, type }) => {
      return pipe(
        searchEventV2Query({
          q: O.fromNullable(query),
          actors: pipe(
            actors,
            O.fromNullable,
            O.filter((actors) => actors.length > 0),
          ),
          groups: pipe(
            groups,
            O.fromNullable,
            O.filter((groups) => groups.length > 0),
          ),
          type: O.fromNullable(type ? [type] : undefined),
        })(ctx),
        LoggerService.TE.debug(ctx, `Results %O`),
        fp.TE.chainEitherK((result) => EventV2IO.decodeMany(result.results)),
        fp.TE.map((events) => {
          if (events.length === 0) {
            return {
              content: [
                {
                  text: `No events found matching the search criteria${query ? ` for "${query}"` : ""}.`,
                  type: "text" as const,
                },
              ],
            };
          }
          return {
            content: events.map((eventResult) => {
              return {
                text: formatEventToMarkdown(eventResult),
                uri: `event://${eventResult.id}`,
                type: "text" as const,
              };
            }),
          };
        }),
        throwTE,
      );
    },
  );

  // Base schema shared by all event creation tools
  const baseEventSchema = Schema.Struct({
    date: Schema.String.annotations({
      description: "Event date in ISO format (YYYY-MM-DD)",
    }),
    draft: Schema.Boolean.annotations({
      description: "Whether the event is a draft (true) or published (false)",
    }),
    excerpt: Schema.NullOr(Schema.String).annotations({
      description:
        "Short description/excerpt of the event as plain text or null",
    }),
    body: Schema.NullOr(Schema.String).annotations({
      description: "Full body/description of the event as plain text or null",
    }),
    media: Schema.Array(UUID).annotations({
      description: "Array of media UUIDs to associate with the event",
    }),
    links: Schema.Array(UUID).annotations({
      description: "Array of link UUIDs to associate with the event",
    }),
    keywords: Schema.Array(UUID).annotations({
      description: "Array of keyword UUIDs to associate with the event",
    }),
  });

  // Create Uncategorized Event Tool
  const createUncategorizedInputSchema = effectToZodStruct(
    Schema.Struct({
      ...baseEventSchema.fields,
      title: Schema.String.annotations({
        description: "Title of the event",
      }),
      actors: Schema.Array(UUID).annotations({
        description: "Array of actor UUIDs involved in the event",
      }),
      groups: Schema.Array(UUID).annotations({
        description: "Array of group UUIDs involved in the event",
      }),
      groupsMembers: Schema.Array(UUID).annotations({
        description: "Array of group member UUIDs involved in the event",
      }),
      location: Schema.UndefinedOr(UUID).annotations({
        description: "Location UUID where the event occurred or undefined",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "End date of the event in ISO format (YYYY-MM-DD) or undefined for single-day events",
      }),
    }),
  );

  server.registerTool(
    CREATE_UNCATEGORIZED_EVENT,
    {
      title: "Create uncategorized event",
      description:
        "Create a new uncategorized event in the database. Uncategorized events are general factual occurrences with associated actors, groups, media, and links. Returns the created event details in structured markdown format.",
      annotations: { title: "Create uncategorized event", tool: true },
      inputSchema: createUncategorizedInputSchema,
    },
    async ({
      date,
      draft,
      excerpt,
      body,
      media,
      links,
      keywords,
      title,
      actors,
      groups,
      groupsMembers,
      location,
      endDate,
    }) => {
      const eventBody: CreateEventBody = {
        type: UNCATEGORIZED.literals[0],
        date: new Date(date),
        draft,
        excerpt: excerpt ? toInitialValue(excerpt) : undefined,
        body: body ? toInitialValue(body) : undefined,
        media: media ?? [],
        links: links ?? [],
        keywords: keywords ?? [],
        payload: {
          title,
          actors: actors ?? [],
          groups: groups ?? [],
          groupsMembers: groupsMembers ?? [],
          location: O.fromNullable(location),
          endDate: pipe(
            O.fromNullable(endDate),
            O.map((d) => new Date(d)),
          ),
        },
      };

      return pipe(
        createEvent(eventBody)(ctx),
        LoggerService.TE.debug(ctx, "Created uncategorized event %O"),
        fp.TE.map((event) => ({
          content: [
            {
              text: formatEventToMarkdown(event),
              type: "text" as const,
              uri: `event://${event.id}`,
            },
          ],
        })),
        throwTE,
      );
    },
  );

  // Create Book Event Tool
  const createBookInputSchema = effectToZodStruct(
    Schema.Struct({
      ...baseEventSchema.fields,
      title: Schema.String.annotations({
        description: "Title of the book",
      }),
      pdfMediaId: UUID.annotations({
        description: "UUID of the PDF media for the book (required)",
      }),
      audioMediaId: Schema.UndefinedOr(UUID).annotations({
        description: "UUID of the audio media for the book (optional)",
      }),
      authors: Schema.Array(
        Schema.Struct({
          type: Schema.Union(
            Schema.Literal("Actor"),
            Schema.Literal("Group"),
          ).annotations({
            description: 'Type of author: "Actor" or "Group"',
          }),
          id: UUID.annotations({
            description: "UUID of the actor or group",
          }),
        }),
      ).annotations({
        description: "Array of authors (actors or groups) with their IDs",
      }),
      publisher: Schema.UndefinedOr(
        Schema.Struct({
          type: Schema.Union(
            Schema.Literal("Actor"),
            Schema.Literal("Group"),
          ).annotations({
            description: 'Type of publisher: "Actor" or "Group"',
          }),
          id: UUID.annotations({
            description: "UUID of the publisher actor or group",
          }),
        }),
      ).annotations({
        description: "Publisher information (optional)",
      }),
    }),
  );

  server.registerTool(
    CREATE_BOOK_EVENT,
    {
      title: "Create book event",
      description:
        "Create a new book event in the database. Book events represent published books with authors, publishers, and associated media (PDF, audio). Returns the created book event details in structured markdown format.",
      annotations: { title: "Create book event", tool: true },
      inputSchema: createBookInputSchema,
    },
    async ({
      date,
      draft,
      excerpt,
      body,
      media,
      links,
      keywords,
      title,
      pdfMediaId,
      audioMediaId,
      authors,
      publisher,
    }) => {
      const eventBody: CreateBookBody = {
        type: BOOK.literals[0],
        date: new Date(date),
        draft,
        excerpt: excerpt ? toInitialValue(excerpt) : undefined,
        body: body ? toInitialValue(body) : undefined,
        media: media ?? [],
        links: links ?? [],
        keywords: keywords ?? [],
        payload: {
          title,
          media: {
            pdf: pdfMediaId,
            audio: audioMediaId,
          },
          authors,
          publisher,
        },
      };

      return pipe(
        createEvent(eventBody)(ctx),
        LoggerService.TE.debug(ctx, "Created book event %O"),
        fp.TE.map((event) => ({
          content: [
            {
              text: formatEventToMarkdown(event),
              type: "text" as const,
              uri: `event://${event.id}`,
            },
          ],
        })),
        throwTE,
      );
    },
  );

  // Create Quote Event Tool
  const createQuoteInputSchema = effectToZodStruct(
    Schema.Struct({
      ...baseEventSchema.fields,
      actor: Schema.UndefinedOr(UUID).annotations({
        description: "UUID of the actor who made the quote (optional)",
      }),
      subject: Schema.UndefinedOr(
        Schema.Struct({
          type: Schema.Union(
            Schema.Literal("Actor"),
            Schema.Literal("Group"),
          ).annotations({
            description: 'Type of subject: "Actor" or "Group"',
          }),
          id: UUID.annotations({
            description: "UUID of the actor or group",
          }),
        }),
      ).annotations({
        description: "Subject of the quote (optional)",
      }),
      quote: Schema.UndefinedOr(Schema.String).annotations({
        description: "The quote text itself (optional)",
      }),
      details: Schema.UndefinedOr(Schema.String).annotations({
        description: "Additional details or context about the quote (optional)",
      }),
    }),
  );

  server.registerTool(
    CREATE_QUOTE_EVENT,
    {
      title: "Create quote event",
      description:
        "Create a new quote event in the database. Quote events represent statements or quotes made by actors, with optional subject and contextual details. Returns the created quote event details in structured markdown format.",
      annotations: { title: "Create quote event", tool: true },
      inputSchema: createQuoteInputSchema,
    },
    async ({
      date,
      draft,
      excerpt,
      body,
      media,
      links,
      keywords,
      actor,
      subject,
      quote,
      details,
    }) => {
      const eventBody: CreateQuoteBody = {
        type: QUOTE.literals[0],
        date: new Date(date),
        draft,
        excerpt: excerpt ? toInitialValue(excerpt) : undefined,
        body: body ? toInitialValue(body) : undefined,
        media: media ?? [],
        links: links ?? [],
        keywords: keywords ?? [],
        payload: {
          actor,
          subject,
          quote,
          details,
        },
      };

      return pipe(
        createEvent(eventBody)(ctx),
        LoggerService.TE.debug(ctx, "Created quote event %O"),
        fp.TE.map((event) => ({
          content: [
            {
              text: formatEventToMarkdown(event),
              type: "text" as const,
              uri: `event://${event.id}`,
            },
          ],
        })),
        throwTE,
      );
    },
  );

  // Create Patent Event Tool
  const createPatentInputSchema = effectToZodStruct(
    Schema.Struct({
      ...baseEventSchema.fields,
      title: Schema.String.annotations({
        description: "Title of the patent",
      }),
      ownerActors: Schema.Array(UUID).annotations({
        description: "Array of actor UUIDs who own the patent",
      }),
      ownerGroups: Schema.Array(UUID).annotations({
        description: "Array of group UUIDs who own the patent",
      }),
      source: UUID.annotations({
        description: "UUID of the source/reference for the patent",
      }),
    }),
  );

  server.registerTool(
    CREATE_PATENT_EVENT,
    {
      title: "Create patent event",
      description:
        "Create a new patent event in the database. Patent events represent registered patents with their owners (actors and/or groups) and source documentation. Returns the created patent event details in structured markdown format.",
      annotations: { title: "Create patent event", tool: true },
      inputSchema: createPatentInputSchema,
    },
    async ({
      date,
      draft,
      excerpt,
      body,
      media,
      links,
      keywords,
      title,
      ownerActors,
      ownerGroups,
      source,
    }) => {
      const eventBody: CreatePatentBody = {
        type: PATENT.literals[0],
        date: new Date(date),
        draft,
        excerpt: excerpt ? toInitialValue(excerpt) : undefined,
        body: body ? toInitialValue(body) : undefined,
        media: media ?? [],
        links: links ?? [],
        keywords: keywords ?? [],
        payload: {
          title,
          owners: {
            actors: ownerActors ?? [],
            groups: ownerGroups ?? [],
          },
          source,
        },
      };

      return pipe(
        createEvent(eventBody)(ctx),
        LoggerService.TE.debug(ctx, "Created patent event %O"),
        fp.TE.map((event) => ({
          content: [
            {
              text: formatEventToMarkdown(event),
              type: "text" as const,
              uri: `event://${event.id}`,
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
