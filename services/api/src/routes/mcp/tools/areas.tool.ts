import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { editArea } from "@liexp/backend/lib/flows/areas/editArea.flow.js";
import {
  FIND_AREAS,
  CREATE_AREA,
  EDIT_AREA,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchAreas } from "@liexp/backend/lib/queries/areas/fetchAreas.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import type { ServerContext } from "#context/context.type.js";

const areaToOutput = (area: AreaEntity): Record<string, unknown> => ({
  id: area.id,
  label: area.label,
  slug: area.slug,
  draft: area.draft ?? false,
  body: area.body ?? undefined,
  featuredImage: area.featuredImage
    ? typeof area.featuredImage === "string"
      ? area.featuredImage
      : {
          id: area.featuredImage.id,
          createdAt: area.featuredImage.createdAt.toISOString(),
          updatedAt: area.featuredImage.updatedAt.toISOString(),
        }
    : undefined,
  media: (area.media ?? []).map((m) => (typeof m === "string" ? m : m.id)),
  events: (area.events ?? []).map((e) => (typeof e === "string" ? e : e.id)),
  socialPosts: (area.socialPosts ?? []).map((s) =>
    typeof s === "string" ? s : s.id,
  ),
  geometry: area.geometry ?? undefined,
  createdAt: area.createdAt.toISOString(),
  updatedAt: area.updatedAt.toISOString(),
  deletedAt: area.deletedAt?.toISOString(),
});

export const registerAreasTools = (server: McpServer, ctx: ServerContext) => {
  // --- findAreas ---
  const findAreasInputSchema = effectToZodStruct(
    Schema.Struct({
      query: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full-text search query",
      }),
      sort: Schema.optional(
        Schema.Union(
          Schema.Literal("label"),
          Schema.Literal("slug"),
          Schema.Literal("createdAt"),
          Schema.Literal("updatedAt"),
        ),
      ).annotations({
        description:
          'Sort field: "label", "slug", "createdAt", or "updatedAt". Defaults to createdAt',
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
    FIND_AREAS,
    {
      title: "Find areas",
      description:
        "Search and list areas in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find areas", readOnlyHint: true },
      inputSchema: findAreasInputSchema,
    },
    async (opts) => {
      const { query, sort, order, start, end } = opts ?? {};

      // Build query matching ListAreaQuery shape expected by fetchAreas
      const areaQuery: Record<string, unknown> = {};
      if (query) areaQuery.q = O.some(query);
      if (sort) areaQuery._sort = O.some(sort);
      if (order) areaQuery._order = O.some(order);
      if (start !== undefined) areaQuery._start = O.some(Number(start));
      if (end !== undefined) areaQuery._end = O.some(Number(end));

      try {
        const te = fetchAreas(
          areaQuery as Parameters<typeof fetchAreas>[0],
          false,
        )(ctx);
        const result = await pipe(
          te,
          fp.TE.map(([results, total]) => ({
            areas: results.map((a) => areaToOutput(a)),
            total,
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find areas",
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
        ctx.logger.error.log("findAreas error: %O", err);
        throw new Error(
          `Failed to find areas: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  // --- createArea ---
  const createAreaInputSchema = effectToZodStruct(
    Schema.Struct({
      label: Schema.String.annotations({
        description: "Name of the area (e.g., country, city, region)",
      }),
      slug: Schema.String.annotations({
        description: "URL-friendly slug for the area",
      }),
      draft: Schema.Boolean.annotations({
        description: "Whether the area is a draft (not yet published)",
      }),
      geometry: Schema.Union(
        Schema.Any,
        Schema.Null,
        Schema.Undefined,
      ).annotations({
        description:
          "GeoJSON geometry object for the area location (e.g., { type: 'Point', coordinates: [lng, lat] })",
      }),
      body: Schema.Union(Schema.Any, Schema.Null, Schema.Undefined).annotations(
        {
          description:
            "Full description as BlockNote document (array of blocks)",
        },
      ),
    }),
  );

  server.registerTool(
    CREATE_AREA,
    {
      title: "Create area",
      description: "Create a new area (geographic location) in the database.",
      annotations: { title: "Create area" },
      inputSchema: createAreaInputSchema,
    },
    async (opts) => {
      const { label, slug, draft, geometry, body } = opts ?? {};

      if (!label || !slug) {
        throw new Error("label and slug are required");
      }

      try {
        // Check if area with same slug already exists
        const existingTE = ctx.db.findOne(AreaEntity, {
          where: { slug: Equal(slug) },
          loadRelationIds: true,
        });

        const existingResult = await pipe(
          existingTE,
          fp.TE.map((a) => fp.O.isSome(a)),
        )();

        if (fp.E.isLeft(existingResult)) {
          throw new Error("Failed to check existing area");
        }

        let area: AreaEntity;
        if (existingResult.right) {
          // Area with this slug already exists - return it
          const fetched = await pipe(
            existingTE,
            fp.TE.chain((a) =>
              fp.O.isSome(a)
                ? ctx.db.findOneOrFail(AreaEntity, {
                    where: { id: Equal(a.value.id) },
                    loadRelationIds: true,
                  })
                : TE.left(new Error("Area not found")),
            ),
          )();

          if (fp.E.isLeft(fetched)) {
            throw new Error("Failed to fetch existing area");
          }
          area = fetched.right;
        } else {
          // Create new area
          const areaPayload: Record<string, unknown> = {
            label,
            slug,
            draft: draft ?? true,
            geometry: geometry ?? { type: "Point", coordinates: [0, 0] },
            body: body ?? undefined,
          };

          const saved = await pipe(
            ctx.db.save(AreaEntity, [removeUndefinedFromPayload(areaPayload)]),
            fp.TE.map(([a]) => a),
            fp.TE.chain((a) =>
              ctx.db.findOneOrFail(AreaEntity, {
                where: { id: Equal(a.id) },
                loadRelationIds: true,
              }),
            ),
          )();

          if (fp.E.isLeft(saved)) {
            throw new Error("Failed to save area");
          }
          area = saved.right;
        }

        return {
          content: [
            {
              text: JSON.stringify({ area: areaToOutput(area) }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("createArea error: %O", err);
        throw new Error(
          `Failed to create area: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  // --- editArea ---
  const editAreaInputSchema = effectToZodStruct(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "UUID of the area to edit (required)",
      }),
      label: Schema.Union(
        Schema.String,
        Schema.Null,
        Schema.Undefined,
      ).annotations({
        description: "New label for the area or null to keep current",
      }),
      slug: Schema.Union(
        Schema.String,
        Schema.Null,
        Schema.Undefined,
      ).annotations({
        description: "New slug for the area or null to keep current",
      }),
      draft: Schema.Union(Schema.Boolean, Schema.Undefined).annotations({
        description: "New draft status or undefined to keep current",
      }),
      geometry: Schema.Union(
        Schema.Any,
        Schema.Null,
        Schema.Undefined,
      ).annotations({
        description: "New geometry or null to keep current",
      }),
      body: Schema.Union(Schema.Any, Schema.Null, Schema.Undefined).annotations(
        {
          description: "New body content or null to keep current",
        },
      ),
      featuredImage: Schema.Union(
        Schema.String,
        Schema.Null,
        Schema.Undefined,
      ).annotations({
        description: "UUID of the featured image",
      }),
      media: Schema.Union(
        Schema.Array(Schema.String),
        Schema.Undefined,
      ).annotations({
        description: "Array of media UUIDs associated with this area",
      }),
      events: Schema.Union(
        Schema.Array(Schema.String),
        Schema.Undefined,
      ).annotations({
        description: "Array of event UUIDs associated with this area",
      }),
      updateGeometry: Schema.Union(
        Schema.Boolean,
        Schema.Undefined,
      ).annotations({
        description:
          "If true, fetch new coordinates from the label using geocoding",
      }),
    }),
  );

  server.registerTool(
    EDIT_AREA,
    {
      title: "Edit area",
      description: "Update an existing area in the database.",
      annotations: { title: "Edit area", destructiveHint: true },
      inputSchema: editAreaInputSchema,
    },
    async (opts) => {
      const {
        id,
        label,
        slug,
        draft,
        geometry,
        body,
        featuredImage,
        media,
        events,
        updateGeometry,
      } = opts ?? {};

      if (!id) {
        throw new Error("Area ID is required");
      }

      try {
        // Build edit input for the flow
        const flowInput: Record<string, unknown> = { id };
        if (label !== undefined) flowInput.label = label;
        if (slug !== undefined) flowInput.slug = slug;
        if (draft !== undefined) flowInput.draft = draft;
        if (geometry !== undefined) flowInput.geometry = geometry;
        if (body !== undefined) flowInput.body = body;
        if (featuredImage !== undefined)
          flowInput.featuredImage = featuredImage;
        if (media !== undefined) flowInput.media = media;
        if (events !== undefined) flowInput.events = events;
        if (updateGeometry !== undefined)
          flowInput.updateGeometry = updateGeometry;

        // Call editArea flow with context
        const te = editArea(
          flowInput as unknown as Parameters<typeof editArea>[0],
        )(ctx);
        const result = await pipe(
          te,
          fp.TE.map((a) => areaToOutput(a as unknown as AreaEntity)),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to edit area",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify({
                area: result.right,
              }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("editArea error: %O", err);
        throw new Error(
          `Failed to edit area: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );
};
