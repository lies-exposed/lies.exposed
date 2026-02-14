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
        "Search for media (images, videos, PDFs, audio) by title, location, type, or keywords. CRITICAL: Always search before creating media to avoid duplicates.\\n\\nSEARCH CRITERIA:\\n- query: Search in title or description (e.g., 'book cover', 'covid chart')\\n- location: Filter by media URL or location\\n- type: Filter by media type (image, video, pdf, audio, other)\\n- sort: createdAt (default) or title\\n- order: ASC or DESC\\n\\nEXAMPLES:\\n1. Find images: query='chart', type='image'\\n2. Find by title: query='book cover'\\n3. Find all PDFs: type='pdf'\\n\\nReturns media items with full details (type, URL, dimensions, metadata).",
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
      description:
        "Get media by id. Returns the media item in markdown format.",
      annotations: { title: "Get media" },
      inputSchema: effectToZodStruct(GetMediaInputSchema),
    },
    flow(getMediaToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_MEDIA,
    {
      title: "Create media",
      description: `Create a media entity in the system. Use this tool to register any media (image, video, PDF, audio, etc.) that can be referenced by UUID in actors, groups, and event creation.

TWO MODES:

1. EXTERNAL URL (autoUpload: false, default):
   Use for URLs that are already hosted externally (e.g., external image URLs).
   The system stores a reference to the external URL.

2. UPLOAD & STORE (autoUpload: true):
   The system downloads the file from the URL and uploads it to internal storage.
   Use this for files you want stored in the system (e.g., book covers, PDFs).

WORKFLOW:
1. Have a URL to media (external or local)
2. Call createMedia with the URL and autoUpload flag
3. Receive back a UUID
4. Use UUID in other tools (e.g., pdfMediaId in createBookEvent, avatar in createActor)

EXAMPLE - External URL:
{
  "location": "https://example.com/image.jpg",
  "label": "Book Cover",
  "type": "image",
  "description": "Cover of the economics textbook"
}

EXAMPLE - Upload to storage:
{
  "location": "https://cdn.example.com/book.pdf",
  "label": "Economics Textbook",
  "type": "pdf",
  "description": "Primary economics textbook",
  "autoUpload": true
}

NOTES:
- Use findMedia first to check if similar media already exists
- Supported types: image, video, pdf, audio, document
- autoUpload defaults to false (external reference only)`,
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
    UPLOAD_MEDIA_FROM_URL,
    {
      title: "⚠️ DEPRECATED - Upload media from URL",
      description: `⚠️ DEPRECATED: Use createMedia with autoUpload: true instead.

This tool is kept for backward compatibility but should not be used for new implementations.

MIGRATION:
Old: uploadMediaFromURL({ url, type, label, description })
New: createMedia({ location: url, type, label, description, autoUpload: true })

Both do the same thing. Prefer createMedia for clarity.`,
      annotations: { title: "Upload media from URL (deprecated)" },
      inputSchema: effectToZodStruct(CreateMediaInputSchema),
    },
    (input) =>
      pipe(
        createMediaToolTask({
          ...input,
          autoUpload: true, // Deprecated tool always uploads
          description: input.description ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    EDIT_MEDIA,
    {
      title: "Edit media",
      description: `Update an existing media entity in the database. Only provide fields you want to 
change; omitted fields keep their existing values.

REQUIRED:
- id: The unique identifier of the media to update

OPTIONAL (provide only fields to change):
- location: URL of the media file (external URL or storage URL)
- type: Type of media (Image, Video, PDF, Audio, etc.)
- label: Title or label for the media
- description: Detailed description of the media content

UPDATE BEHAVIOR:
- Omitted fields: Keep their current values
- Provided fields: Update with new values

TIPS:
- Use findMedia() to search for the media if unsure of ID
- Only include fields you want to change
- Media can be referenced by UUID in actors, groups, and events
- Returns the updated media with full details`,
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
