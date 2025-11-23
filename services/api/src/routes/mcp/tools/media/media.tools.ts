import {
  CREATE_MEDIA,
  EDIT_MEDIA,
  FIND_MEDIA,
  GET_MEDIA,
  UPLOAD_MEDIA_FROM_URL,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import {
  CreateMediaInputSchema,
  createMediaToolTask,
} from "./createMedia.tool.js";
import { EditMediaInputSchema, editMediaToolTask } from "./editMedia.tool.js";
import { FindMediaInputSchema, findMediaToolTask } from "./findMedia.tool.js";
import { GetMediaInputSchema, getMediaToolTask } from "./getMedia.tool.js";
import {
  UploadMediaFromURLInputSchema,
  uploadMediaFromURLToolTask,
} from "./uploadMediaFromURL.tool.js";

export const registerMediaTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_MEDIA,
    {
      title: "Find media",
      description:
        "Search for media using various criteria like title, location or keywords. Returns the media item in markdown format.",
      annotations: { tool: true },
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
      description:
        "Get media by id. Returns the media item in markdown format.",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(GetMediaInputSchema),
    },
    flow(getMediaToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    UPLOAD_MEDIA_FROM_URL,
    {
      title: "Upload media from URL",
      description: `Download an image or media file from a URL and upload it to storage. Returns the uploaded media entity with UUID that can be used when creating actors, groups, or events. You should check if the media location already exists with ${FIND_MEDIA} tool to avoid duplicates.`,
      annotations: { tool: true },
      inputSchema: effectToZodStruct(UploadMediaFromURLInputSchema),
    },
    flow(uploadMediaFromURLToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_MEDIA,
    {
      title: "Create media",
      description:
        "Create a media entity in the database with an existing URL (e.g., external image URL). The created media can be referenced by its UUID when creating actors, groups, or events. Use uploadMediaFromURL if you need to download and upload the file to storage first.",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(CreateMediaInputSchema),
    },
    flow(createMediaToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    EDIT_MEDIA,
    {
      title: "Edit media",
      description:
        "Edit a media entity in the database with an existing URL (e.g., external image URL). The edited media can be referenced by its UUID when creating actors, groups, or events. Use uploadMediaFromURL if you need to download and upload the file to storage first.",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(EditMediaInputSchema),
    },
    flow(editMediaToolTask, throwRTE(ctx)),
  );
};
