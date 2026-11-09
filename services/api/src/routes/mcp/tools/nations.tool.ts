import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Schema } from "effect";
import type * as TE from "fp-ts/lib/TaskEither.js";
import * as fp from "fp-ts/lib/taskEither.js";
import { type NationEntity } from "@liexp/backend/lib/entities/Nation.entity.js";
import { type ServerContext } from "../../../context/context.type.js";
import { defineMcpTool } from "./helpers.js";

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
  const findNationsTool = defineMcpTool(
    Schema.Struct({
      name: Schema.UndefinedOr(Schema.String).annotations({
        description: "Name to search for (partial match supported)",
      }),
      start: Schema.optional(Schema.Number).annotations({
        description: "Pagination start index",
      }),
      end: Schema.optional(Schema.Number).annotations({
        description: "Pagination end index",
      }),
    }),
    async (input) => {
      const { name, start, end } = input;

      const findOptions: Parameters<
        typeof ctx.db.findAndCount
      >[1] = {
        ...(name ? { where: { name: name } } : {}),
        ...(start !== undefined ? { skip: Number(start) } : {}),
        ...(end !== undefined ? { take: Number(end) } : {}),
      };

      try {
        const te: TE.TaskEither<unknown, [NationEntity[], number]> =
          ctx.db.findAndCount(NationEntity, findOptions);
        const result = await pipe(
          te,
          fp.TE.map(([nations, total]) => ({
            nations: nations.map(nationToOutput),
            total,
          })),
        )();

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

  server.registerTool(
    FIND_NATIONS,
    {
      title: FIND_NATIONS,
      titleLocalized: "",
      description: "Find nations by name with pagination support",
      inputSchema: findNationsTool.inputSchema,
    },
    findNationsTool.handler,
  );
};
