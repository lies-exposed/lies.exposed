import { MediaIO } from "@liexp/backend/lib/io/media.io.js";
import {
  CREATE_MEDIA,
  EDIT_MEDIA,
  FIND_MEDIA,
  GET_MEDIA,
  UPLOAD_MEDIA_FROM_URL,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchManyMedia } from "@liexp/backend/lib/queries/media/fetchManyMedia.query.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../context/context.type.js";
import { createMediaFromURLFlow } from "../../../flows/media/createMediaFromURL.flow.js";
import { editMedia } from "../../../flows/media/editMedia.flow.js";
import { uploadMediaFromURLFlow } from "../../../flows/media/uploadMediaFromURL.flow.js";
import { formatMediaToMarkdown } from "./formatters/mediaToMarkdown.formatter.js";

export const registerMediaTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_MEDIA,
    {
      title: "Find media",
      description:
        "Search for media using various criteria like title, location or keywords. Returns the media item in markdown format.",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.String.annotations({
            description:
              "Search query string to filter media by title or description",
          }),
          location: Schema.UndefinedOr(URL).annotations({
            description: "Location associated with the media",
          }),
          type: Schema.UndefinedOr(MediaType).annotations({
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
    async ({ query, location, type, sort, order }) => {
      // Validate string inputs
      const validSort =
        sort === "createdAt" || sort === "title" || sort === "type"
          ? sort
          : undefined;
      const validOrder =
        order === "ASC" || order === "DESC" ? order : undefined;

      const result = pipe(
        fetchManyMedia<ServerContext>({
          q: O.some(query),
          location: O.fromNullable(location),
          type: O.fromNullable(type),
          _sort: O.fromNullable(validSort),
          _order: O.fromNullable(validOrder),
        }),
        LoggerService.RTE.debug("Results %O"),
        fp.RTE.chainEitherK(([media]) => MediaIO.decodeMany(media)),
        fp.RTE.map((media) => {
          if (media.length === 0) {
            return {
              content: [
                {
                  text: `No media found matching the search criteria${query ? ` for "${query}"` : ""}.`,
                  type: "text" as const,
                },
              ],
            };
          }
          return {
            content: media.map((m) => ({
              text: formatMediaToMarkdown(m),
              type: "text" as const,
              href: `media://${m.id}`,
            })),
          };
        }),
        throwRTE(ctx),
      );

      return result;
    },
  );

  server.registerTool(
    GET_MEDIA,
    {
      title: "Get media",
      description:
        "Get media by id. Returns the media item in markdown format.",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          id: UUID.annotations({
            description: "UUID of the media to retrieve",
          }),
        }),
      ),
    },
    async ({ id }) => {
      return pipe(
        MediaRepository.findOneOrFail<ServerContext>({
          where: { id: Equal(id) },
        }),
        LoggerService.RTE.debug("Results %O"),
        fp.RTE.chainEitherK((media) => MediaIO.decodeSingle(media)),
        fp.RTE.map((media) => {
          return {
            content: [
              {
                text: formatMediaToMarkdown(media),
                type: "text" as const,
                href: `media://${media.id}`,
              },
            ],
          };
        }),
        throwRTE(ctx),
      );
    },
  );

  // Upload media from URL tool
  server.registerTool(
    UPLOAD_MEDIA_FROM_URL,
    {
      title: "Upload media from URL",
      description: `Download an image or media file from a URL and upload it to storage. Returns the uploaded media entity with UUID that can be used when creating actors, groups, or events. You should check if the media location already exists with ${FIND_MEDIA} tool to avoid duplicates.`,
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
        }),
        fp.RTE.chainEitherK((media) => MediaIO.decodeSingle(media)),
        fp.RTE.map((media) => ({
          content: [
            {
              text: formatMediaToMarkdown(media),
              type: "text" as const,
              href: `media://${media.id}`,
            },
          ],
        })),
        throwRTE(ctx),
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
        createMediaFromURLFlow(
          {
            id: uuid(),
            location,
            type,
            label,
            description,
            areas: [],
            keywords: [],
            links: [],
            events: [],
            thumbnail: undefined,
            extra: undefined,
          },
          null,
        ),
        fp.RTE.chainEitherK((media) => MediaIO.decodeSingle(media)),
        fp.RTE.map((media) => ({
          content: [
            {
              text: formatMediaToMarkdown(media),
              type: "text" as const,
              href: `media://${media.id}`,
            },
          ],
        })),
        throwRTE(ctx),
      );
    },
  );

  // Edit media tool (for existing URLs)
  server.registerTool(
    EDIT_MEDIA,
    {
      title: "Edit media",
      description:
        "Edit a media entity in the database with an existing URL (e.g., external image URL). The edited media can be referenced by its UUID when creating actors, groups, or events. Use uploadMediaFromURL if you need to download and upload the file to storage first.",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          id: UUID.annotations({
            description: "UUID of the media to edit",
          }),
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
    async ({ id, location, type, label, description }) => {
      return pipe(
        editMedia(id, {
          location,
          type,
          label,
          description: O.fromNullable(description),
          areas: [],
          keywords: [],
          links: [],
          events: [],
          thumbnail: O.none(),
          extra: O.none(),
          overrideExtra: O.none(),
          overrideThumbnail: O.none(),
          transfer: O.none(),
          transferThumbnail: O.none(),
          restore: O.none(),
          creator: O.none(),
        }),
        fp.RTE.chainEitherK((media) => MediaIO.decodeSingle(media)),
        fp.RTE.map((media) => ({
          content: [
            {
              text: formatMediaToMarkdown(media),
              type: "text" as const,
              href: `media://${media.id}`,
            },
          ],
        })),
        throwRTE(ctx),
      );
    },
  );
};
