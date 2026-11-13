import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "fp-ts/lib/Option.js";
import type { ServerContext } from "#context/context.type.js";
import { createMediaFlow } from "#flows/media/createMedia.flow.js";
import { editMedia } from "#flows/media/editMedia.flow.js";
import { fetchManyMedia } from "#queries/media/fetchManyMedia.query.js";

// Tool names (mirrored from toolNames.constants.ts)
const FIND_MEDIA = "findMedia";
const CREATE_MEDIA = "createMedia";
const EDIT_MEDIA = "editMedia";

const mediaToOutput = (media: MediaEntity) => ({
  id: media.id,
  location: media.location,
  label: media.label ?? media.location,
  description: media.description ?? undefined,
  thumbnail: media.thumbnail ?? undefined,
  type: media.type,
  extra: media.extra ?? undefined,
  events: (media.events ?? []).map((e) => (Schema.is(UUID)(e) ? e : e.id)),
  links: (media.links ?? []).map((l) => (Schema.is(UUID)(l) ? l : l.id)),
  keywords: (media.keywords ?? []).map((k) => (Schema.is(UUID)(k) ? k : k.id)),
  areas: (media.areas ?? []).map((a) => (Schema.is(UUID)(a) ? a : a.id)),
  creator:
    media.creator && Schema.is(UUID)(media.creator)
      ? media.creator
      : media.creator?.id,
  createdAt: media.createdAt.toISOString(),
  updatedAt: media.updatedAt.toISOString(),
});

export const registerMediaTools = (server: McpServer, ctx: ServerContext) => {
  // --- findMedia ---
  const findMediaInputSchema = effectToZodStruct(
    Schema.Struct({
      query: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full-text search query (matches label or description)",
      }),
      sort: Schema.optional(
        Schema.Union(
          Schema.Literal("createdAt"),
          Schema.Literal("updatedAt"),
          Schema.Literal("label"),
          Schema.Literal("type"),
        ),
      ).annotations({
        description:
          'Sort field: "createdAt", "updatedAt", "label", or "type". Defaults to updatedAt',
      }),
      order: Schema.optional(
        Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
      ).annotations({
        description: 'Sort order: "ASC" for ascending or "DESC" for descending',
      }),
      start: Schema.optional(Schema.Number).annotations({
        description: "Pagination start index",
      }),
      end: Schema.optional(Schema.Number).annotations({
        description: "Pagination end index",
      }),
    }),
  );

  server.registerTool(
    FIND_MEDIA,
    {
      title: "Find media",
      description:
        "Search and list media files in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find media", readOnlyHint: true },
      inputSchema: findMediaInputSchema,
    },
    async (opts) => {
      const { query, sort, order, start, end } = opts ?? {};

      // fetchManyMedia expects effect Options for every query field
      const mediaQuery: Record<string, unknown> = {
        ...(query ? { q: O.some(query) } : {}),
        ...(sort ? { _sort: O.some(sort) } : {}),
        ...(order ? { _order: O.some(order) } : {}),
        ...(start !== undefined ? { _start: O.some(Number(start)) } : {}),
        ...(end !== undefined ? { _end: O.some(Number(end)) } : {}),
      };

      try {
        const te = fetchManyMedia(mediaQuery)(ctx);
        const result = await pipe(
          te,
          fp.TE.map(([results, total]) => ({
            media: results.map(mediaToOutput),
            total,
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find media",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(result.right),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("findMedia error: %O", err);
        throw new Error(
          `Failed to find media: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  // --- createMedia ---
  const createMediaInputSchema = effectToZodStruct(
    Schema.Struct({
      location: Schema.String.annotations({
        description: "URL or path of the media file (required)",
      }),
      type: Schema.String.annotations({
        description: 'MIME type of the media (e.g., "image/jpeg", "video/mp4")',
      }),
      label: Schema.optional(Schema.String).annotations({
        description: "Display label for the media (defaults to location)",
      }),
      description: Schema.optional(Schema.String).annotations({
        description: "Description of the media content",
      }),
      thumbnail: Schema.optional(Schema.String).annotations({
        description: "URL of a thumbnail image",
      }),
      events: Schema.optional(Schema.Array(Schema.String)).annotations({
        description: "Array of event UUIDs to associate with this media",
      }),
      links: Schema.optional(Schema.Array(Schema.String)).annotations({
        description: "Array of link UUIDs to associate with this media",
      }),
      keywords: Schema.optional(Schema.Array(Schema.String)).annotations({
        description: "Array of keyword UUIDs to associate with this media",
      }),
      areas: Schema.optional(Schema.Array(Schema.String)).annotations({
        description: "Array of area UUIDs to associate with this media",
      }),
    }),
  );

  server.registerTool(
    CREATE_MEDIA,
    {
      title: "Create media",
      description:
        "Create a new media entry in the database. The media will be processed and thumbnails generated.",
      annotations: { title: "Create media", destructiveHint: true },
      inputSchema: createMediaInputSchema,
    },
    async (opts) => {
      const {
        location,
        type,
        label,
        description,
        thumbnail,
        events,
        links,
        keywords,
        areas,
      } = opts ?? {};

      if (!location) {
        throw new Error("Media location is required");
      }
      if (!type) {
        throw new Error("Media type is required");
      }

      try {
        // Build CreateMedia body for the flow (using casting for branded types)
        const createBody: Record<string, unknown> = {
          id: undefined,
          location,
          type,
          label: label ?? undefined,
          description: description ?? undefined,
          thumbnail: thumbnail ?? undefined,
          events: events ?? [],
          links: links ?? [],
          keywords: keywords ?? [],
          areas: areas ?? [],
          extra: undefined,
        };

        // Call createMediaFlow with context (no user for MCP tools)
        const te = createMediaFlow(
          createBody as Parameters<typeof createMediaFlow>[0],
          null as Parameters<typeof createMediaFlow>[1],
        )(ctx);
        const result = await pipe(
          te,
          fp.TE.map((results: MediaEntity[]) => results.map(mediaToOutput)),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create media",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(result.right),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("createMedia error: %O", err);
        throw new Error(
          `Failed to create media: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  // --- editMedia ---
  const editMediaInputSchema = effectToZodStruct(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "UUID of the media to edit (required)",
      }),
      thumbnail: Schema.optional(
        Schema.Union(Schema.String, Schema.Null),
      ).annotations({
        description:
          "New thumbnail URL, null to remove, or undefined to keep current",
      }),
      location: Schema.optional(Schema.String).annotations({
        description: "New location URL or undefined to keep current",
      }),
      label: Schema.optional(Schema.String).annotations({
        description: "New display label or undefined to keep current",
      }),
      description: Schema.optional(
        Schema.Union(Schema.String, Schema.Null),
      ).annotations({
        description:
          "New description, null to clear, or undefined to keep current",
      }),
      extra: Schema.optional(
        Schema.Record({ key: Schema.String, value: Schema.Any }),
      ).annotations({
        description: "New extra metadata object or undefined to keep current",
      }),
      events: Schema.optional(Schema.Array(Schema.String)).annotations({
        description:
          "Array of event UUIDs to associate, or undefined to keep current",
      }),
      links: Schema.optional(Schema.Array(Schema.String)).annotations({
        description:
          "Array of link UUIDs to associate, or undefined to keep current",
      }),
      keywords: Schema.optional(Schema.Array(Schema.String)).annotations({
        description:
          "Array of keyword UUIDs to associate, or undefined to keep current",
      }),
      areas: Schema.optional(Schema.Array(Schema.String)).annotations({
        description:
          "Array of area UUIDs to associate, or undefined to keep current",
      }),
      creator: Schema.optional(
        Schema.Union(Schema.String, Schema.Null),
      ).annotations({
        description:
          "New creator UUID, null to remove, or undefined to keep current",
      }),
      overrideThumbnail: Schema.optional(Schema.Boolean).annotations({
        description: "If true, regenerate thumbnail from the media location",
      }),
      overrideExtra: Schema.optional(Schema.Boolean).annotations({
        description: "If true, regenerate extra metadata from the media",
      }),
      transfer: Schema.optional(Schema.Boolean).annotations({
        description:
          "If true, transfer media from external provider to local storage",
      }),
      transferThumbnail: Schema.optional(Schema.Boolean).annotations({
        description: "If true, transfer thumbnail from external provider",
      }),
      restore: Schema.optional(Schema.Boolean).annotations({
        description: "If true, restore a previously deleted media entry",
      }),
    }),
  );

  server.registerTool(
    EDIT_MEDIA,
    {
      title: "Edit media",
      description:
        "Update an existing media entry in the database. Provide the media ID and any fields to update.",
      annotations: { title: "Edit media", destructiveHint: true },
      inputSchema: editMediaInputSchema,
    },
    async (opts) => {
      const {
        id,
        thumbnail,
        location,
        label,
        description,
        extra,
        events,
        links,
        keywords,
        areas,
        creator,
        overrideThumbnail,
        overrideExtra,
        transfer,
        transferThumbnail,
        restore,
      } = opts ?? {};

      if (!id) {
        throw new Error("Media ID is required");
      }

      try {
        // First, fetch the existing media to get its type
        const existingMedia = await ctx.db.manager.findOne(MediaEntity, {
          where: { id },
          relations: ["creator"],
        } as Parameters<typeof ctx.db.manager.findOne>[1]);

        if (!existingMedia) {
          throw new Error(`Media with id ${id} not found`);
        }

        const currentType = existingMedia.type;

        // Build EditMediaBody for the flow (following actors.tool.ts pattern)
        const flowInput: Record<string, unknown> = {
          type: currentType,
          thumbnail: thumbnail ?? undefined,
          location: location ?? undefined,
          label: label ?? undefined,
          description: description ?? undefined,
          extra: extra ?? undefined,
          events: events ?? [],
          links: links ?? [],
          keywords: keywords ?? [],
          areas: areas ?? [],
          creator: creator !== undefined ? creator : undefined,
          overrideThumbnail: overrideThumbnail,
          overrideExtra: overrideExtra,
          transfer: transfer,
          transferThumbnail: transferThumbnail,
          restore: restore,
        };

        // Call editMedia flow with context
        const te = editMedia(
          id as UUID,
          flowInput as unknown as Parameters<typeof editMedia>[1],
        )(ctx);
        const result = await pipe(
          te,
          fp.TE.map((r) => mediaToOutput(r)),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to edit media",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(result.right),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("editMedia error: %O", err);
        throw new Error(
          `Failed to edit media: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );
};
