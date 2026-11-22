import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { type UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { UserRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EditMediaBody } from "@liexp/io/lib/http/Media/index.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "fp-ts/lib/Option.js";
import { Equal } from "typeorm";
import { asFlowInput } from "./helpers.js";
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
      ids: Schema.optional(Schema.Array(Schema.String)).annotations({
        description:
          "Fetch specific media by UUID (use this to get a record by id)",
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
      const { query, ids, sort, order, start, end } = opts ?? {};

      // fetchManyMedia expects effect Options for every query field
      const mediaQuery: Record<string, unknown> = {
        ...(query ? { q: O.some(query) } : {}),
        ...(ids && ids.length > 0 ? { ids: O.some(ids) } : {}),
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
    async (opts, extra) => {
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

        // Attribute the media to the authenticated caller, when known
        const callerId = extra?.authInfo?.extra?.userId;
        const found =
          typeof callerId === "string"
            ? await UserRepository.findOne({
                where: { id: Equal(callerId as UUID) },
              })(ctx)()
            : undefined;
        const creator: UserEntity | null =
          found && fp.E.isRight(found) ? O.toNullable(found.right) : null;

        const te = createMediaFlow(
          createBody as Parameters<typeof createMediaFlow>[0],
          creator,
        )(ctx);
        const result = await pipe(
          te,
          fp.TE.map((results: MediaEntity[]) => results.map(mediaToOutput)),
        )();

        if (fp.E.isLeft(result)) {
          if ((result.left as { status?: number }).status === 429) {
            throw new Error(
              `The source host rate-limited the request (HTTP 429) for ${location}. Retry later or use a different source URL.`,
            );
          }
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
        // Fetch the existing media: the flow requires type/location/label and
        // full relation arrays, and saves relations as given, so omitted fields
        // must default to the current values (never to [] which would wipe them).
        const existingMedia = await ctx.db.manager.findOne(MediaEntity, {
          where: { id: Equal(id as UUID) },
          loadRelationIds: {
            relations: ["creator", "keywords", "links", "events", "areas"],
          },
        });

        if (!existingMedia) {
          throw new Error(`Media with id ${id} not found`);
        }

        const relationIds = (
          xs: readonly (string | { id: string })[] | undefined,
        ): string[] =>
          (xs ?? []).map((x) => (typeof x === "string" ? x : x.id));

        // Decode through the flow's body schema so every optional field becomes
        // an Option and arrays/dates are validated. Location stays a plain
        // string: locally stored media use non-URL paths.
        const decodeBody = Schema.decodeUnknownEither(
          Schema.Struct({
            ...EditMediaBody.fields,
            location: Schema.String,
          }),
        );
        const decoded = decodeBody({
          type: existingMedia.type,
          thumbnail,
          location: location ?? existingMedia.location,
          label: label ?? existingMedia.label ?? existingMedia.location,
          description,
          extra,
          events: events ?? relationIds(existingMedia.events),
          links: links ?? relationIds(existingMedia.links),
          keywords: keywords ?? relationIds(existingMedia.keywords),
          areas: areas ?? relationIds(existingMedia.areas),
          creator,
          overrideThumbnail,
          overrideExtra,
          transfer,
          transferThumbnail,
          restore,
        });

        if (fp.E.isLeft(decoded)) {
          throw new Error(`Invalid editMedia input: ${decoded.left.message}`);
        }

        const flowInput = decoded.right;

        // Call editMedia flow with context
        const te = editMedia(
          id as UUID,
          asFlowInput<Parameters<typeof editMedia>[1]>(flowInput),
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
