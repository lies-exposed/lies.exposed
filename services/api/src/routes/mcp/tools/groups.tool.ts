import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import {
  CREATE_GROUP,
  EDIT_GROUP,
  FIND_GROUPS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateGroupBody, type Group } from "@liexp/io/lib/http/Group.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import { defineMcpTool } from "./helpers.js";
import type { ServerContext } from "#context/context.type.js";
import { createGroup } from "#flows/groups/createGroup.flow.js";
import { editGroup } from "#flows/groups/editGroup.flow.js";

// Local copy of EditGroupInput (not exported from editGroup.flow.ts)
import { type EditGroupBody } from "@liexp/io/lib/http/Group.js";
interface EditGroupInput extends EditGroupBody {
  id: string;
}

const groupToOutput = (group: Group): Record<string, unknown> => ({
  id: group.id,
  name: group.name,
  username: group.username ?? undefined,
  kind: group.kind,
  color: group.color,
  avatar: group.avatar ?? undefined,
  members: group.members ?? [],
  subGroups: group.subGroups ?? [],
  body: group.body ?? undefined,
  excerpt: group.excerpt ?? undefined,
  startDate: group.startDate ?? undefined,
  endDate: group.endDate ?? undefined,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

export const registerGroupsTools = (server: McpServer, ctx: ServerContext) => {
  // --- findGroups ---
  const findGroupsTool = defineMcpTool(
    Schema.Struct({
      query: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Search query string to filter groups by name, excerpt, or body",
      }),
      sort: Schema.UndefinedOr(
        Schema.Union(
          Schema.Literal("id"),
          Schema.Literal("name"),
          Schema.Literal("createdAt"),
          Schema.Literal("updatedAt"),
        ),
      ).annotations({
        description: 'Sort field: "id", "name", "createdAt", or "updatedAt"',
      }),
      order: Schema.UndefinedOr(
        Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
      ).annotations({
        description: 'Sort order: "ASC" or "DESC"',
      }),
      start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Pagination offset (default: 0)",
      }),
      end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Pagination limit (default: 20)",
      }),
    }),
    async (input) => {
      const { query, sort, order, start, end } = input;

      const groupQuery: Record<string, unknown> = {};
      if (query) {
        groupQuery.q = query;
      }
      if (sort) {
        groupQuery.sort = sort;
      }
      if (order) {
        groupQuery.order = order;
      }
      if (start !== undefined) {
        groupQuery.start = Number(start);
      }
      if (end !== undefined) {
        groupQuery.end = Number(end);
      }

      try {
        const te = fetchGroups(groupQuery)(ctx);
        const result = await pipe(
          te,
          fp.TE.map(([groups, total]) => ({
            groups: groups.map((g) => {
              const decoded = GroupIO.decodeSingle(g);
              if (fp.E.isRight(decoded)) {
                return groupToOutput(decoded.right);
              }
              ctx.logger.error.log("decode group error: %O", decoded.left);
              return {
                id: g.id,
                name: g.name,
                username: undefined,
                kind: "Public" as const,
                color: "",
                avatar: undefined,
                members: [],
                subGroups: [],
                body: undefined,
                excerpt: undefined,
                startDate: undefined,
                endDate: undefined,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
            }),
            total,
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find groups",
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
        ctx.logger.error.log("findGroups error: %O", err);
        throw new Error(
          `Failed to find groups: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    FIND_GROUPS,
    {
      title: "Find groups",
      description:
        "Search and list groups in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find groups", readOnlyHint: true },
      inputSchema: findGroupsTool.inputSchema,
    },
    findGroupsTool.handler,
  );

  // --- createGroup ---
  const createGroupTool = defineMcpTool(
    Schema.Struct({
      name: Schema.String.annotations({
        description: "Name of the group (required)",
      }),
      username: Schema.String.annotations({
        description: "Unique username identifier for the group (required)",
      }),
      color: Schema.String.annotations({
        description:
          "Color associated with the group in hex format without # (required)",
      }),
      kind: Schema.Union(
        Schema.Literal("Public"),
        Schema.Literal("Private"),
      ).annotations({
        description: "Visibility type of the group (Public or Private)",
      }),
      excerpt: Schema.UndefinedOr(Schema.Unknown).annotations({
        description: "Short description of the group",
      }),
      body: Schema.UndefinedOr(Schema.Unknown).annotations({
        description: "Full description of the group",
      }),
      startDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Group establishment or start date (ISO 8601 string)",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Group end date (ISO 8601 string)",
      }),
      avatar: Schema.UndefinedOr(Schema.Any).annotations({
        description: "Avatar URL or ID",
      }),
      members: Schema.UndefinedOr(
        Schema.Array(Schema.Union(Schema.String, Schema.Any)),
      ).annotations({
        description:
          "Initial member list (array of actor UUIDs or member objects)",
      }),
      search: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Wikipedia search query to find an existing group (if provided, name/username/color are ignored)",
      }),
    }),
    async (input) => {
      try {
        if (input.search) {
          // Wikipedia search mode - use CreateGroupBody
          const createBody: CreateGroupBody = {
            search: input.search,
          };
          const te = createGroup(createBody)(ctx);
          const result = await pipe(
            te,
            fp.TE.map((g) => {
              if ("success" in g) {
                return { success: true };
              }
              return groupToOutput(g);
            }),
          )();

          if (fp.E.isLeft(result)) {
            throw new Error(
              (result.left as Error).message ?? "Failed to create group",
            );
          }

          return {
            content: [
              {
                text: JSON.stringify({ group: result.right }),
                type: "text" as const,
              },
            ],
          };
        }

        // Direct creation mode
        const createBody: CreateGroupBody = {
          name: input.name,
          username: input.username,
          color: input.color,
          kind: input.kind ?? "Public",
          excerpt: input.excerpt ?? undefined,
          body: input.body ?? undefined,
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          avatar: input.avatar ?? undefined,
          members: input.members ?? [],
        };

        const te = createGroup(createBody)(ctx);
        const result = await pipe(
          te,
          fp.TE.map((g) => {
            if ("success" in g) {
              return { success: true };
            }
            return groupToOutput(g);
          }),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create group",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify({ group: result.right }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("createGroup error: %O", err);
        throw new Error(
          `Failed to create group: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    CREATE_GROUP,
    {
      title: "Create group",
      description:
        "Create a new group in the database. Provide name, username, color, and optionally a Wikipedia search query.",
      annotations: { title: "Create group", destructiveHint: true },
      inputSchema: createGroupTool.inputSchema,
    },
    createGroupTool.handler,
  );

  // --- editGroup ---
  const editGroupTool = defineMcpTool(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "ID of the group to edit (required)",
      }),
      name: Schema.UndefinedOr(Schema.String).annotations({
        description: "New name",
      }),
      username: Schema.UndefinedOr(Schema.String).annotations({
        description: "New username",
      }),
      color: Schema.UndefinedOr(Schema.String).annotations({
        description: "New color in hex format without #",
      }),
      kind: Schema.UndefinedOr(
        Schema.Union(Schema.Literal("Public"), Schema.Literal("Private")),
      ).annotations({
        description: "New visibility type",
      }),
      excerpt: Schema.UndefinedOr(Schema.Unknown).annotations({
        description: "New short description",
      }),
      body: Schema.UndefinedOr(Schema.Unknown).annotations({
        description: "New full description",
      }),
      startDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "New start date (ISO 8601 string)",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "New end date (ISO 8601 string)",
      }),
      members: Schema.UndefinedOr(
        Schema.Array(Schema.Union(Schema.String, Schema.Unknown)),
      ).annotations({
        description: "New member list (array of actor UUIDs or member objects)",
      }),
    }),
    async (input) => {
      try {
        // input already has Option<T> fields from the MCP schema validation.
        // Cast to EditGroupInput so we can pass it to editGroup.
        const editInput = { ...input, id: input.id } as unknown as EditGroupInput;
        const te = editGroup(editInput)(ctx);

        // editGroup already calls GroupIO.decodeSingle internally and returns
        // a decoded Group, so we can use the result directly.
        const result = await pipe(
          te,
          fp.TE.mapLeft((err) => {
            ctx.logger.error.log("editGroup error: %O", err);
            return err;
          }),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to edit group",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify({ group: groupToOutput(result.right) }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("editGroup error: %O", err);
        throw new Error(
          `Failed to edit group: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    EDIT_GROUP,
    {
      title: "Edit group",
      description: "Edit an existing group in the database.",
      annotations: { title: "Edit group", destructiveHint: true },
      inputSchema: editGroupTool.inputSchema,
    },
    editGroupTool.handler,
  );
};
