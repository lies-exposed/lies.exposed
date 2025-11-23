import {
  CREATE_BOOK_EVENT,
  CREATE_PATENT_EVENT,
  CREATE_QUOTE_EVENT,
  CREATE_UNCATEGORIZED_EVENT,
  FIND_EVENTS,
  GET_EVENT,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import {
  CreateBookEventInputSchema,
  createBookEventToolTask,
} from "./createBookEvent.tool.js";
import {
  CreatePatentEventInputSchema,
  createPatentEventToolTask,
} from "./createPatentEvent.tool.js";
import {
  CreateQuoteEventInputSchema,
  createQuoteEventToolTask,
} from "./createQuoteEvent.tool.js";
import {
  CreateUncategorizedEventInputSchema,
  createUncategorizedEventToolTask,
} from "./createUncategorizedEvent.tool.js";
import {
  FindEventsInputSchema,
  findEventsToolTask,
} from "./findEvents.tool.js";
import { GetEventInputSchema, getEventToolTask } from "./getEvent.tool.js";

export const registerEventTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_EVENTS,
    {
      title: "Find events",
      description:
        "Search for events using various criteria like title, keywords, actor and group ids. Returns the story in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(FindEventsInputSchema),
    },
    flow(findEventsToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    GET_EVENT,
    {
      title: "Get event",
      description: "Get an event by its ID. Returns the event in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(GetEventInputSchema),
    },
    flow(getEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_UNCATEGORIZED_EVENT,
    {
      title: "Create uncategorized event",
      description:
        "Create a new uncategorized event in the database. Uncategorized events are general factual occurrences with associated actors, groups, media, and links. Returns the created event details in structured markdown format.",
      annotations: { title: "Create uncategorized event", tool: true },
      inputSchema: effectToZodStruct(CreateUncategorizedEventInputSchema),
    },
    flow(createUncategorizedEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_BOOK_EVENT,
    {
      title: "Create book event",
      description:
        "Create a new book event in the database. Book events represent published books with authors, publishers, and associated media (PDF, audio). Returns the created book event details in structured markdown format.",
      annotations: { title: "Create book event", tool: true },
      inputSchema: effectToZodStruct(CreateBookEventInputSchema),
    },
    flow(createBookEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_QUOTE_EVENT,
    {
      title: "Create quote event",
      description:
        "Create a new quote event in the database. Quote events represent statements or quotes made by actors, with optional subject and contextual details. Returns the created quote event details in structured markdown format.",
      annotations: { title: "Create quote event", tool: true },
      inputSchema: effectToZodStruct(CreateQuoteEventInputSchema),
    },
    flow(createQuoteEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_PATENT_EVENT,
    {
      title: "Create patent event",
      description:
        "Create a new patent event in the database. Patent events represent registered patents with their owners (actors and/or groups) and source documentation. Returns the created patent event details in structured markdown format.",
      annotations: { title: "Create patent event", tool: true },
      inputSchema: effectToZodStruct(CreatePatentEventInputSchema),
    },
    flow(createPatentEventToolTask, throwRTE(ctx)),
  );
};
