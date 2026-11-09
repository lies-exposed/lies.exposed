import { NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import type { ServerContext } from "#context/context.type.js";

const FIND_NATIONS = "findNations";

const nationToOutput = (nation: NationEntity): Record<string, unknown> => ({
  id: nation.id,
  name: nation.name,
  isoCode: nation.isoCode,
  description: nation.description ?? undefined,
  actors: (nation.actors ?? []).map((a) =>
    typeof a === "string" ? a : a.id,
  ),
  createdAt: nation.createdAt.toISOString(),
  updatedAt: nation.updatedAt.toISOString(),
});

export const registerNationsTools = (server: McpServer, ctx: ServerContext) => {
  // --- findNations ---
  const findNationsInputSchema = effectToZodStruct(
    Schema.Struct({
      name: Schema.UndefinedOr(Schema.String).annotations({
        description: "Name to search for (partial match supported)",
      }),
      start: Schema.UndefinedOr(Schema.Number).annotations({
        description: "Pagination start index",
      }),
      end: Schema.UndefinedOr(Schema.Number).annotations({
        description: "Pagination end index",
      }),
    }),
  );

  server.registerTool(
    FIND_NATIONS,
    {
      title: "Find nations",
      description:
        "Search and list nations in the database with filtering and pagination.",
      annotations: { title: "Find nations", readOnlyHint: true },
      inputSchema: findNationsInputSchema,
    },
    async (opts) => {
      const { name, start, end } = opts ?? {};

      const where: Record<string, unknown> = {};
      if (name) {
        where.name = { like: `%${name}%` };
      }

      const findOptions: Record<string, unknown> = {
        where,
      };
      if (start !== undefined) {
        findOptions.skip = Number(start);
      }
      if (end !== undefined) {
        findOptions.take = Number(end) - Number(start ?? 0);
      }

      try {
        const te = pipe(
          ctx.db.findAndCount(NationEntity, findOptions),
          TE.map(([nations, total]) => ({
            nations: nations.map(nationToOutput),
            total,
          })),
        );
        const result = await te();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find nations",
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
        ctx.logger.error.log("findNations error: %O", err);
        throw new Error(
          `Failed to find nations: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );
};
