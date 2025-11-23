import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import {
  CREATE_AREA,
  FIND_AREAS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchAreas } from "@liexp/backend/lib/queries/areas/fetchAreas.query.js";
import { AreaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import type { CreateAreaBody } from "@liexp/shared/lib/io/http/Area.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../context/context.type.js";
import { formatAreaToMarkdown } from "./formatters/areaToMarkdown.formatter.js";

export const registerAreaTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_AREAS,
    {
      title: "Find area",
      description:
        "Search for areas using various criteria like name or keywords. Returns the area in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.String.annotations({
            description:
              "Search query string to filter areas by name or description",
          }),
          withDeleted: Schema.UndefinedOr(Schema.Boolean).annotations({
            description: "Include deleted areas in the search results",
          }),
          sort: Schema.Union(
            Schema.Literal("createdAt"),
            Schema.Literal("label"),
            Schema.Undefined,
          ).annotations({
            description:
              'Sort field: "createdAt" or "label". Defaults to createdAt',
          }),
          order: Schema.Union(
            Schema.Literal("ASC"),
            Schema.Literal("DESC"),
            Schema.Undefined,
          ).annotations({
            description:
              'Sort order: "ASC" for ascending or "DESC" for descending',
          }),
          start: Schema.UndefinedOr(Schema.Number).annotations({
            description: "Pagination start index",
          }),
          end: Schema.UndefinedOr(Schema.Number).annotations({
            description: "Pagination end index",
          }),
        }),
      ),
    },
    async ({ query, withDeleted, sort, order, start, end }) => {
      return pipe(
        fetchAreas<ServerContext>(
          {
            q: O.some(query),
            _sort: O.fromNullable(sort),
            _order: O.fromNullable(order),
            ids: O.none(),
            draft: O.none(),
            withDeleted: O.fromNullable(withDeleted),
            _start: O.fromNullable(start),
            _end: O.fromNullable(end),
          },
          false,
        ),
        LoggerService.RTE.debug("Results %O"),
        fp.RTE.chainEitherK(([areas]) => AreaIO.decodeMany(areas)),
        fp.RTE.map((decodedAreas) => {
          if (decodedAreas.length === 0) {
            return {
              content: [
                {
                  text: `No areas found matching the search criteria${query ? ` for "${query}"` : ""}.`,
                  type: "text" as const,
                },
              ],
            };
          }
          return {
            content: decodedAreas.map((area) => ({
              text: formatAreaToMarkdown(area),
              type: "text" as const,
              href: `area://${area.id}`,
            })),
          };
        }),
        throwRTE(ctx),
      );
    },
  );

  const createInputSchema = effectToZodStruct(
    Schema.Struct({
      label: Schema.String.annotations({
        description: "Label/name of the area",
      }),
      slug: Schema.String.annotations({
        description: "Unique URL-friendly slug for the area",
      }),
      draft: Schema.Boolean.annotations({
        description: "Whether the area is a draft (true/false)",
      }),
      body: Schema.String.annotations({
        description: "Description/body content of the area",
      }),
      geometry: Schema.Struct({
        type: Schema.Literal("Point").annotations({
          description: "Geometry type (currently only Point is supported)",
        }),
        coordinates: Schema.Array(Schema.Number).annotations({
          description: "Coordinates tuple [longitude, latitude]",
        }),
      }).annotations({
        description: "Geographic geometry of the area",
      }),
    }),
  );

  server.registerTool(
    CREATE_AREA,
    {
      title: "Create area",
      description:
        "Create a new geographic area in the database with the provided information. Returns the created area details in structured markdown format.",
      annotations: { title: "Create area", tool: true },
      inputSchema: createInputSchema,
    },
    async ({ label, slug, draft, body, geometry }) => {
      const areaBody: CreateAreaBody = {
        label,
        slug,
        draft,
        body: toInitialValue(body),
        geometry:
          geometry.type === "Point" && geometry.coordinates.length === 2
            ? {
                type: geometry.type,
                coordinates: [geometry.coordinates[0], geometry.coordinates[1]],
              }
            : (geometry as CreateAreaBody["geometry"]),
      };

      return pipe(
        AreaRepository.findOne<ServerContext>({
          where: { slug: Equal(slug) },
          loadRelationIds: true,
        }),
        fp.RTE.chain((area) => {
          if (fp.O.isSome(area)) {
            return fp.RTE.right([area.value]);
          }
          return AreaRepository.save([areaBody]);
        }),
        fp.RTE.map(([a]) => a),
        fp.RTE.chainEitherK((a) => AreaIO.decodeSingle(a)),
        LoggerService.RTE.debug("Created area %O"),
        fp.RTE.map((area) => ({
          content: [
            {
              text: formatAreaToMarkdown(area),
              type: "text" as const,
            },
          ],
        })),
        throwRTE(ctx),
      );
    },
  );
};
