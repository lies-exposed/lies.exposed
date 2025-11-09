import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { searchEventV2Query } from "@liexp/backend/lib/queries/events/searchEventsV2.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
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
    "findEvents",
    {
      title: "Find events",
      description:
        "Search for events using various criteria like title, keywords, actor and group ids. Returns the story in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.UndefinedOr(Schema.String),
          actors: Schema.UndefinedOr(Schema.Array(UUID)),
          groups: Schema.UndefinedOr(Schema.Array(UUID)),
          type: Schema.UndefinedOr(EventType),
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
        fp.TE.map((result) => ({
          content: result.map((eventResult) => {
            return {
              text: formatEventToMarkdown(eventResult),
              uri: `event://${eventResult.id}`,
              type: "text" as const,
            };
          }),
        })),
        throwTE,
      );
    },
  );

  const createInputSchema = effectToZodStruct(
    Schema.Struct({
      type: EventType.annotations({
        description:
          "Type of the event (Book, Death, Documentary, Patent, ScientificStudy, Transaction, Quote, or Uncategorized)",
      }),
      date: Schema.String.annotations({
        description: "Event date in ISO format (YYYY-MM-DD)",
      }),
      draft: Schema.Boolean.annotations({
        description: "Whether the event is a draft (true) or published (false)",
      }),
      excerpt: Schema.NullOr(Schema.String).annotations({
        description: "Short description/excerpt of the event as plain text",
      }),
      body: Schema.NullOr(Schema.String).annotations({
        description: "Full body/description of the event as plain text",
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
      location: Schema.NullOr(UUID).annotations({
        description: "Location UUID where the event occurred or null",
      }),
      endDate: Schema.NullOr(Schema.String).annotations({
        description:
          "End date of the event in ISO format (YYYY-MM-DD) or null for single-day events",
      }),
    }),
  );

  server.registerTool(
    "createEvent",
    {
      title: "Create event",
      description:
        "Create a new event in the database with the provided information. Events represent factual occurrences with associated actors, groups, media, and links. Returns the created event details in structured markdown format.",
      annotations: { title: "Create event", tool: true },
      inputSchema: createInputSchema,
    },
    async ({
      type,
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
      const eventBody: any = {
        type,
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
          location: location ? O.some(location) : O.none(),
          endDate: endDate ? O.some(new Date(endDate)) : O.none(),
        },
      };

      return pipe(
        createEvent(eventBody)(ctx),
        LoggerService.TE.debug(ctx, "Created event %O"),
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
