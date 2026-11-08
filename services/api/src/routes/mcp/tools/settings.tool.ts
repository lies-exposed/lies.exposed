import { SettingEntity } from "@liexp/backend/lib/entities/Setting.entity.js";
import {
  FIND_SETTINGS,
  CREATE_SETTING,
  EDIT_SETTING,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import type { ServerContext } from "#context/context.type.js";

const settingToOutput = (setting: SettingEntity): Record<string, unknown> => ({
  id: setting.id,
  value: setting.value,
  createdAt: setting.createdAt.toISOString(),
  updatedAt: setting.updatedAt.toISOString(),
});

export const registerSettingsTools = (
  server: McpServer,
  ctx: ServerContext,
) => {
  // --- findSettings ---
  const findSettingsInputSchema = effectToZodStruct(
    Schema.Struct({
      q: Schema.UndefinedOr(Schema.String).annotations({
        description: "Search query (partial match on key)",
      }),
      sort: Schema.Union(
        Schema.Literal("createdAt"),
        Schema.Literal("updatedAt"),
        Schema.Literal("key"),
        Schema.Undefined,
      ).annotations({
        description: 'Sort field: "createdAt", "updatedAt", or "key"',
      }),
      order: Schema.Union(
        Schema.Literal("ASC"),
        Schema.Literal("DESC"),
        Schema.Undefined,
      ).annotations({
        description: 'Sort order: "ASC" for ascending or "DESC" for descending',
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
    FIND_SETTINGS,
    {
      title: "Find settings",
      description:
        "Search and list settings in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find settings", readOnlyHint: true },
      inputSchema: findSettingsInputSchema,
    },
    async (opts) => {
      const { q, sort, order, start, end } = opts ?? {};

      const where: Record<string, unknown> = {};
      if (q) {
        where.id = { like: `%${q}%` };
      }

      const orderClause: Record<string, unknown> = {};
      if (sort) {
        orderClause[sort] = order ?? "DESC";
      }

      const findOptions: Record<string, unknown> = {
        where,
      };
      if (Object.keys(orderClause).length > 0) {
        findOptions.order = orderClause;
      }
      if (start !== undefined) {
        findOptions.skip = Number(start);
      }
      if (end !== undefined) {
        findOptions.take = Number(end) - Number(start ?? 0);
      }

      try {
        const te = pipe(
          ctx.db.findAndCount(SettingEntity, findOptions),
          TE.map(([results, total]) => ({
            settings: results.map(settingToOutput),
            total,
          })),
        );
        const result = await te();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find settings",
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
        ctx.logger.error.log("findSettings error: %O", err);
        throw new Error(
          `Failed to find settings: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  // --- createSetting ---
  const createSettingInputSchema = effectToZodStruct(
    Schema.Struct({
      key: Schema.String.annotations({
        description: "Setting key (required)",
      }),
      value: Schema.String.annotations({
        description: "Setting value (required)",
      }),
    }),
  );

  server.registerTool(
    CREATE_SETTING,
    {
      title: "Create setting",
      description:
        "Create a new setting in the database. Admin-only operation.",
      annotations: { title: "Create setting", destructiveHint: true },
      inputSchema: createSettingInputSchema,
    },
    async (opts) => {
      const { key, value } = opts ?? {};

      if (!key) {
        throw new Error("Setting key is required");
      }
      if (value === undefined) {
        throw new Error("Setting value is required");
      }

      try {
        const te = pipe(
          ctx.db.save(SettingEntity, [{ id: key, value }]),
          TE.chain(() =>
            ctx.db.findOneOrFail(SettingEntity, { where: { id: key } }),
          ),
        );
        const result = await te();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create setting",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(settingToOutput(result.right)),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("createSetting error: %O", err);
        throw new Error(
          `Failed to create setting: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  // --- editSetting ---
  const editSettingInputSchema = effectToZodStruct(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "Key/ID of the setting to edit (required)",
      }),
      key: Schema.UndefinedOr(Schema.String).annotations({
        description: "Setting key or null to keep current",
      }),
      value: Schema.UndefinedOr(Schema.String).annotations({
        description: "Setting value or null to keep current",
      }),
    }),
  );

  server.registerTool(
    EDIT_SETTING,
    {
      title: "Edit setting",
      description:
        "Update an existing setting in the database. Admin-only operation.",
      annotations: { title: "Edit setting", destructiveHint: true },
      inputSchema: editSettingInputSchema,
    },
    async (opts) => {
      const { id, key, value } = opts ?? {};

      if (!id) {
        throw new Error("Setting ID is required");
      }

      try {
        const te = pipe(
          ctx.db.findOneOrFail(SettingEntity, { where: { id } }),
          TE.chain((existing) => {
            const update: Record<string, unknown> = { ...existing };
            if (key !== undefined) update.id = key;
            if (value !== undefined) update.value = value;
            return ctx.db.save(SettingEntity, [update]);
          }),
          TE.chain(() =>
            ctx.db.findOneOrFail(SettingEntity, { where: { id } }),
          ),
        );
        const result = await te();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to edit setting",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(settingToOutput(result.right)),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("editSetting error: %O", err);
        throw new Error(
          `Failed to edit setting: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );
};
