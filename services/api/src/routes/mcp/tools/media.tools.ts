import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import {
  CREATE_MEDIA,
  FIND_MEDIA,
  UPLOAD_MEDIA_FROM_URL,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchManyMedia } from "@liexp/backend/lib/queries/media/fetchManyMedia.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import { MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { createMediaFromURLFlow } from "../../../flows/media/createMediaFromURL.flow.js";
import { uploadMediaFromURLFlow } from "../../../flows/media/uploadMediaFromURL.flow.js";
import { formatMediaToMarkdown } from "./formatters/mediaToMarkdown.formatter.js";

export const registerMediaTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_MEDIA,
    {
      title: "Find media",
      description:
        "Search for media using various criteria like title or keywords. Returns the media item in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.String,
          type: Schema.UndefinedOr(Schema.String).annotations({
            description:
              'Media type: "image/jpeg", "image/png", "video/mp4", "application/pdf", etc.',
          }),
          sort: Schema.UndefinedOr(Schema.String).annotations({
            description:
              'Sort field: "createdAt", "title", or "type". Defaults to createdAt',
          }),
          order: Schema.UndefinedOr(Schema.String).annotations({
            description: 'Sort order: "ASC" or "DESC". Defaults to DESC',
          }),
        }),
      ),
    },
    async ({ query, type, sort, order }) => {
      // Validate string inputs
      const validSort =
        sort === "createdAt" || sort === "title" || sort === "type"
          ? sort
          : undefined;
      const validOrder =
        order === "ASC" || order === "DESC" ? order : undefined;

      return pipe(
        fetchManyMedia({
          q: O.some(query),
          type: type ? O.some(type as any) : O.none(),
          _sort: validSort ? O.some(validSort as any) : O.none(),
          _order: validOrder ? O.some(validOrder as any) : O.none(),
        })(ctx),
        LoggerService.TE.debug(ctx, "Results %O"),
        fp.TE.map(([medias]) => {
          if (medias.length > 0) {
            const media = Schema.decodeUnknownSync(Media)(medias[0]);
            return {
              content: [
                {
                  text: formatMediaToMarkdown(media),
                  type: "text" as const,
                },
              ],
            };
          }
          return {
            content: [
              {
                text: "No media found matching the search criteria.",
                type: "text" as const,
              },
            ],
          };
        }),
        throwTE,
      );
    },
  );

  // Upload media from URL tool
  server.registerTool(
    UPLOAD_MEDIA_FROM_URL,
    {
      title: "Upload media from URL",
      description:
        "Download an image or media file from a URL and upload it to storage. Returns the uploaded media entity with UUID that can be used when creating actors, groups, or events.",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          url: URL.annotations({
            description:
              "URL of the image or media file to download and upload",
          }),
          type: MediaType.annotations({
            description:
              "Type of media (Image, Video, PDF, etc.). Must match the actual file type.",
          }),
          label: Schema.String.annotations({
            description: "Label/title for the media",
          }),
          description: Schema.UndefinedOr(Schema.String).annotations({
            description: "Optional detailed description of the media",
          }),
        }),
      ),
    },
    async ({ url, type, label, description }) => {
      return pipe(
        uploadMediaFromURLFlow({
          id: uuid(),
          url,
          type,
          label,
          description,
        })(ctx),
        fp.TE.chainEitherK((media) => MediaIO.decodeSingle(media)),
        fp.TE.map((media) => ({
          content: [
            {
              text: formatMediaToMarkdown(media),
              type: "text" as const,
              href: `media://${media.id}`,
            },
          ],
        })),
        throwTE,
      );
    },
  );

  // Create media tool (for existing URLs)
  server.registerTool(
    CREATE_MEDIA,
    {
      title: "Create media",
      description:
        "Create a media entity in the database with an existing URL (e.g., external image URL). The created media can be referenced by its UUID when creating actors, groups, or events. Use uploadMediaFromURL if you need to download and upload the file to storage first.",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          location: URL.annotations({
            description:
              "URL of the media file (can be external URL or storage URL)",
          }),
          type: MediaType.annotations({
            description: "Type of media (Image, Video, PDF, etc.)",
          }),
          label: Schema.String.annotations({
            description: "Label/title for the media",
          }),
          description: Schema.UndefinedOr(Schema.String).annotations({
            description: "Optional detailed description of the media",
          }),
        }),
      ),
    },
    async ({ location, type, label, description }) => {
      return pipe(
        createMediaFromURLFlow({
          id: uuid(),
          location,
          type,
          label,
          description,
        })(ctx),
        fp.TE.chainEitherK((media) => MediaIO.decodeSingle(media)),
        fp.TE.map((media) => ({
          content: [
            {
              text: formatMediaToMarkdown(media),
              type: "text" as const,
              href: `media://${media.id}`,
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
