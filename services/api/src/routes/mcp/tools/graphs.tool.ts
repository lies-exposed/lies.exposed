import { GraphEntity } from "@liexp/backend/lib/entities/Graph.entity.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import type { Graph } from "@liexp/io/lib/http/graphs/Graph.js";
import {
  CreateGraphInputSchema,
  EditGraphInputSchema,
  FindGraphsInputSchema,
} from "@liexp/shared/lib/mcp/schemas/graphs.schemas.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { GraphIO } from "../../graphs/graph.io.js";
import { defineMcpTool } from "./helpers.js";
import type { ServerContext } from "#context/context.type.js";

// --- Tool constants ---
const FIND_GRAPHS = "findGraphs";
const CREATE_GRAPH = "createGraph";
const EDIT_GRAPH = "editGraph";

// --- Output helper ---
const graphToOutput = (g: Graph): Record<string, unknown> => ({
  id: g.id,
  type: g.type,
  label: g.label,
  slug: g.slug,
  data: g.data,
  options: g.options,
});

const graphEntityToOutput = (g: GraphEntity): Record<string, unknown> => ({
  id: g.id,
  type: g.graphType,
  label: g.label,
  slug: g.slug,
  data: g.data,
  options: g.options,
});

// --- Register tools ---
export const registerGraphsTools = (server: McpServer, ctx: ServerContext) => {
  // --- findGraphs ---
  const findGraphsTool = defineMcpTool(
    FindGraphsInputSchema,
    async (input) => {
      const { q, sort, order, start, end } = input;

      // Build query options for findAndCount
      const where: Record<string, unknown> = {};
      if (q) {
        where.label = q;
      }

      const findOptions: Record<string, unknown> = {};
      if (sort) {
        findOptions.order = { [sort]: order ?? "DESC" };
      } else {
        findOptions.order = { createdAt: "DESC" };
      }
      if (start !== undefined) {
        findOptions.skip = Number(start);
      }
      if (end !== undefined) {
        findOptions.take = Number(end) - Number(start ?? 0);
      } else if (start !== undefined) {
        // Default page size if end not specified
        findOptions.take = 20;
      }

      try {
        const result = await pipe(
          ctx.db.findAndCount(GraphEntity, {
            where,
            ...findOptions,
          }),
          TE.map(([data, total]) => ({ data, total })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find graphs",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify({
                graphs: result.right.data.map(graphEntityToOutput),
                total: result.right.total,
              }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("findGraphs error: %O", err);
        throw new Error(
          `Failed to find graphs: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    FIND_GRAPHS,
    {
      title: "Find graphs",
      description:
        "Search and list graphs in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find graphs", readOnlyHint: true },
      inputSchema: findGraphsTool.inputSchema,
    },
    findGraphsTool.handler,
  );

  // --- createGraph ---
  const createGraphTool = defineMcpTool(
    CreateGraphInputSchema,
    async (input) => {
      const { type, label, slug, data, options } = input;

      try {
        const result = await pipe(
          TE.Do,
          TE.bind("graph", () =>
            ctx.db.save(GraphEntity, [
              {
                label,
                slug,
                graphType: type,
                options: options ?? {},
                data,
                id: uuid(),
              },
            ]),
          ),
          TE.chain(({ graph }) =>
            pipe(
              ctx.db.findOneOrFail(GraphEntity, {
                where: { id: Equal(graph[0].id) },
              }),
              TE.chainEitherK((d) => GraphIO.decodeSingle(d)),
            ),
          ),
          TE.map((g) => graphToOutput(g)),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create graph",
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
        ctx.logger.error.log("createGraph error: %O", err);
        throw new Error(
          `Failed to create graph: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    CREATE_GRAPH,
    {
      title: "Create graph",
      description:
        "Create a new graph with the specified type, label, slug, data, and options.",
      annotations: { title: "Create graph" },
      inputSchema: createGraphTool.inputSchema,
    },
    createGraphTool.handler,
  );

  // --- editGraph ---
  const editGraphTool = defineMcpTool(
    EditGraphInputSchema,
    async (input) => {
      const { id, type, label, slug, data, options } = input;

      try {
        const result = await pipe(
          TE.Do,
          TE.bind("graph", () =>
            ctx.db.save(GraphEntity, [
              {
                id,
                ...(type !== undefined ? { graphType: type } : {}),
                ...(label !== undefined ? { label } : {}),
                ...(slug !== undefined ? { slug } : {}),
                ...(data !== undefined ? { data } : {}),
                ...(options !== undefined ? { options: options ?? {} } : {}),
              },
            ]),
          ),
          TE.chain(() =>
            ctx.db.findOneOrFail(GraphEntity, { where: { id: Equal(id) } }),
          ),
          TE.chainEitherK((d) => GraphIO.decodeSingle(d)),
          TE.map((g) => graphToOutput(g)),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to edit graph",
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
        ctx.logger.error.log("editGraph error: %O", err);
        throw new Error(
          `Failed to edit graph: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    EDIT_GRAPH,
    {
      title: "Edit graph",
      description:
        "Edit an existing graph by ID. Only provided fields will be updated.",
      annotations: { title: "Edit graph" },
      inputSchema: editGraphTool.inputSchema,
    },
    editGraphTool.handler,
  );
};
