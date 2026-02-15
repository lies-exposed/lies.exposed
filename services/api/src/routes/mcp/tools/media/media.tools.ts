import {
  CREATE_MEDIA,
  EDIT_MEDIA,
  FIND_MEDIA,
  GET_MEDIA,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import {
  CreateMediaInputSchema,
  createMediaToolTask,
} from "./createMedia.tool.js";
import { EditMediaInputSchema, editMediaToolTask } from "./editMedia.tool.js";
import { FindMediaInputSchema, findMediaToolTask } from "./findMedia.tool.js";
import { GetMediaInputSchema, getMediaToolTask } from "./getMedia.tool.js";

export const registerMediaTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_MEDIA,
    {
      title: "Find media",
      description:
        "Search for media by title, location, or type. Supports filtering by image, video, pdf, audio types.",
      annotations: { title: "Find media" },
      inputSchema: effectToZodStruct(FindMediaInputSchema),
    },
    (input) =>
      pipe(
        findMediaToolTask({
          query: input.query,
          location: input.location,
          type: input.type,
          sort: input.sort,
          order: input.order,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    GET_MEDIA,
    {
      title: "Get media",
      description: "Retrieve media by ID.",
      annotations: { title: "Get media" },
      inputSchema: effectToZodStruct(GetMediaInputSchema),
    },
    flow(getMediaToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_MEDIA,
    {
      title: "Create media",
      description:
        "Create media entity for images, videos, PDFs, or audio. With autoUpload=false: stores external URL reference. With autoUpload=true: downloads and stores internally. Returns UUID for reference in actors/groups/events.",
      annotations: { title: "Create media" },
      inputSchema: effectToZodStruct(CreateMediaInputSchema),
    },
    (input) =>
      pipe(
        createMediaToolTask({
          ...input,
          description: input.description ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    EDIT_MEDIA,
    {
      title: "Edit media",
      description:
        "Update media. Only provide fields to change; omitted fields keep current values.",
      annotations: { title: "Edit media" },
      inputSchema: effectToZodStruct(EditMediaInputSchema),
    },
    (input) =>
      pipe(
        editMediaToolTask({
          ...input,
          description: input.description ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );
};
