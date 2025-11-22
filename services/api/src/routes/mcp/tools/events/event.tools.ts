import {
  CREATE_BOOK_EVENT,
  CREATE_PATENT_EVENT,
  CREATE_QUOTE_EVENT,
  CREATE_SCIENTIFIC_STUDY_EVENT,
  CREATE_UNCATEGORIZED_EVENT,
  FIND_EVENTS,
  GET_EVENT,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
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
  CreateScientificStudyEventInputSchema,
  createScientificStudyEventToolTask,
} from "./createScientificStudyEvent.tool.js";
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
        "Search for events using various criteria like title, keywords, actor and group ids. Use this tool to check if a similar event already exists before creating a new one. Returns the story in JSON format.",
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
        "Create a new uncategorized event in the database. Uncategorized events are general factual occurrences with associated actors, groups, media, and links. IMPORTANT: Before creating, use findActors and findGroups to search for existing entities and get their IDs. Only use IDs from search results - do NOT create new actors/groups just for this event. It's OK to create events with empty arrays for actors, groups, or keywords if no existing matches are found. Be efficient to stay under the 25 recursion limit - search once and reuse results. Returns the created event details in structured markdown format.",
      annotations: { title: "Create uncategorized event", tool: true },
      inputSchema: effectToZodStruct(CreateUncategorizedEventInputSchema),
    },
    (input) =>
      pipe(
        createUncategorizedEventToolTask({
          ...input,
          location: input.location ?? undefined,
          endDate: input.endDate ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    CREATE_BOOK_EVENT,
    {
      title: "Create book event",
      description:
        "Create a new book event in the database. Book events represent published books with authors, publishers, and associated media (PDF, audio). IMPORTANT: Search for existing authors (findActors) and publisher (findGroups) first, and only use IDs from search results. Empty arrays for authors/publisher are acceptable. Be efficient to stay under the 25 recursion limit. Returns the created book event details in structured markdown format.",
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
        "Create a new quote event in the database. Quote events represent statements or quotes made by actors, with optional subject and contextual details. IMPORTANT: Search for the quote author using findActors first, and use existing IDs only. Be efficient with tool calls to stay under the 25 recursion limit. Returns the created quote event details in structured markdown format.",
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
        "Create a new patent event in the database. Patent events represent registered patents with their owners (actors and/or groups) and source documentation. IMPORTANT: Search for patent owners using findActors/findGroups first, use existing IDs only. Empty arrays for owners are acceptable. Stay efficient to remain under the 25 recursion limit. Returns the created patent event details in structured markdown format.",
      annotations: { title: "Create patent event", tool: true },
      inputSchema: effectToZodStruct(CreatePatentEventInputSchema),
    },
    flow(createPatentEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_SCIENTIFIC_STUDY_EVENT,
    {
      title: "Create scientific study event",
      description:
        "Create a new scientific study event in the database. Scientific study events represent published research papers, clinical trials, or academic studies. CRITICAL: Do NOT create new actors for study authors or groups for publishers - ONLY use existing entity IDs. Workflow: 1) Search for authors using findActors, 2) Search for publisher using findGroups, 3) Use ONLY the IDs found in search results, 4) If authors/publisher not found, leave those fields empty (empty array for authors, null for publisher). It's perfectly OK to create a scientific study event with empty authors/publisher arrays. This keeps you under the 25 recursion limit. Returns the created event details in structured markdown format.",
      annotations: { title: "Create scientific study event", tool: true },
      inputSchema: effectToZodStruct(CreateScientificStudyEventInputSchema),
    },
    (input) =>
      pipe(
        createScientificStudyEventToolTask({
          ...input,
          image: input.image ?? undefined,
          publisher: input.publisher ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );
};
