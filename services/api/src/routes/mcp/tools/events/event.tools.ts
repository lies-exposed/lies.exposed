import {
  CREATE_EVENT,
  EDIT_EVENT,
  FIND_EVENTS,
  GET_EVENT,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import {
  CreateUnifiedEventInputSchema,
  createUnifiedEventToolTask,
} from "./createUnifiedEvent.tool.js";
import { EditEventInputSchema, editEventToolTask } from "./editEvent.tool.js";
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
        "Search for events by title, keywords, actors, or groups. Supports filtering and sorting by date or title.",
      annotations: { title: "Find events" },
      inputSchema: effectToZodStruct(FindEventsInputSchema),
    },
    flow(findEventsToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    GET_EVENT,
    {
      title: "Get event",
      description: "Get an event by its ID. Returns the event in JSON format",
      annotations: { title: "Get event" },
      inputSchema: effectToZodStruct(GetEventInputSchema),
    },
    flow(getEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_EVENT,
    {
      title: "Create event (unified)",
      description:
        "Create any event type using unified interface with type discrimination. Search for actors/groups first to get UUIDs. Payload fields vary by event type (Book, Quote, Death, Patent, etc.).",
      annotations: { title: "Create event (unified)" },
      inputSchema: effectToZodStruct(CreateUnifiedEventInputSchema),
    },
    flow(createUnifiedEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    EDIT_EVENT,
    {
      title: "Edit event",
      description:
        "Update an event. Only provide fields to change; omitted fields keep current values. Payload structure depends on event type (Book, Quote, Death, etc.).",
      annotations: { title: "Edit event" },
      inputSchema: effectToZodStruct(EditEventInputSchema),
    },
    ({
      date,
      draft,
      excerpt,
      body,
      media,
      links,
      keywords,
      payload,
      ...input
    }) =>
      pipe(
        editEventToolTask({
          ...input,
          draft,
          date: date ?? undefined,
          excerpt,
          body,
          media,
          links,
          keywords,
          payload,
        }),
        throwRTE(ctx),
      ),
  );
};
