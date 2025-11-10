import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { AreaIO } from "@liexp/backend/lib/io/Area.io.js";
import {
  CREATE_AREA,
  FIND_AREAS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchAreas } from "@liexp/backend/lib/queries/areas/fetchAreas.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import type { CreateAreaBody } from "@liexp/shared/lib/io/http/Area.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
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
          query: Schema.String,
          withDeleted: Schema.UndefinedOr(Schema.Boolean),
          sort: Schema.Union(
            Schema.Literal("createdAt"),
            Schema.Literal("label"),
            Schema.Undefined,
          ),
          order: Schema.Union(
            Schema.Literal("ASC"),
            Schema.Literal("DESC"),
            Schema.Undefined,
          ),
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
        fetchAreas(
          {
            q: O.some(query),
            _sort: sort ? O.some(sort) : O.none(),
            _order: order ? O.some(order) : O.none(),
            ids: O.none(),
            draft: O.none(),
            withDeleted: O.fromNullable(withDeleted),
            _start: O.fromNullable(start),
            _end: O.fromNullable(end),
          },
          false,
        )(ctx),
        LoggerService.TE.debug(ctx, `Results %O`),
        fp.TE.chainEitherK(([areas]) => AreaIO.decodeMany(areas)),
        fp.TE.map((decodedAreas) => {
          return {
            content: [
              {
                text: decodedAreas
                  .map(formatAreaToMarkdown)
                  .join("\n\n---\n\n"),
                type: "text" as const,
              },
            ],
          };
        }),
        throwTE,
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
        coordinates: Schema.Tuple(Schema.Number, Schema.Number).annotations({
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
        geometry,
      };

      return pipe(
        ctx.db.findOne(AreaEntity, {
          where: { slug: Equal(slug) },
          loadRelationIds: true,
        }),
        TE.chain((area) => {
          if (fp.O.isSome(area)) {
            return TE.right([area.value]);
          }
          return ctx.db.save(AreaEntity, [areaBody]);
        }),
        fp.TE.map(([a]) => a),
        TE.chainEitherK((a) => AreaIO.decodeSingle(a)),
        LoggerService.TE.debug(ctx, "Created area %O"),
        fp.TE.map((area) => ({
          content: [
            {
              text: formatAreaToMarkdown(area),
              type: "text" as const,
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
