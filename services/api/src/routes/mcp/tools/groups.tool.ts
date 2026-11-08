import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import {
  CREATE_GROUP,
  EDIT_GROUP,
  FIND_GROUPS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Group } from "@liexp/io/lib/http/Group.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
// eslint-disable-next-line import-x/order, @typescript-eslint/consistent-type-imports
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerContext } from "#context/context.type.js";
// eslint-disable-next-line import-x/no-unresolved
import { createGroup } from "#flows/groups/createGroup.flow.js";
// eslint-disable-next-line import-x/no-unresolved
import { editGroup } from "#flows/groups/editGroup.flow.js";

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
  const findGroupsInputSchema = effectToZodStruct(
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
  );

  server.registerTool(
    FIND_GROUPS,
    {
      title: "Find groups",
      description:
        "Search and list groups in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find groups" },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: findGroupsInputSchema as unknown as {
        query?: any;
        sort?: any;
        order?: any;
        start?: any;
        end?: any;
      },
    },
    async (opts) => {
      const { query, sort, order, start, end } = opts ?? {};

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

  // --- createGroup ---
  const createGroupInputSchema = effectToZodStruct(
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
      excerpt: Schema.UndefinedOr(Schema.Any).annotations({
        description: "Short description of the group",
      }),
      body: Schema.UndefinedOr(Schema.Any).annotations({
        description: "Full description of the group",
      }),
      startDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Group establishment or start date (ISO 8601 string)",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Group dissolution or end date (ISO 8601 string)",
      }),
      members: Schema.UndefinedOr(
        Schema.Array(
          Schema.Struct({
            actor: Schema.String.annotations({
              description: "Actor UUID for the member",
            }),
            body: Schema.Any.annotations({
              description: "Description of the membership",
            }),
            startDate: Schema.String.annotations({
              description: "Membership start date (ISO 8601 string)",
            }),
            endDate: Schema.UndefinedOr(Schema.String).annotations({
              description: "Membership end date (ISO 8601 string)",
            }),
          }),
        ),
      ).annotations({
        description: "List of members with their details",
      }),
    }),
  );

  server.registerTool(
    CREATE_GROUP,
    {
      title: "Create group",
      description: "Create a new group in the database.",
      annotations: { title: "Create group" },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: createGroupInputSchema as unknown as {
        name: any;
        username: any;
        color: any;
        kind: any;
        excerpt?: any;
        body?: any;
        startDate?: any;
        endDate?: any;
        members?: any;
      },
    },
    async (opts) => {
      const {
        name,
        username,
        color,
        kind,
        excerpt,
        body,
        startDate,
        endDate,
        members,
      } = opts ?? {};

      try {
        const createBody: Record<string, unknown> = {
          name,
          username,
          color,
          kind,
          avatar: undefined,
        };
        if (excerpt !== undefined) createBody.excerpt = excerpt;
        if (body !== undefined) createBody.body = body;
        if (startDate !== undefined) createBody.startDate = new Date(startDate);
        if (endDate !== undefined) createBody.endDate = new Date(endDate);
        if (members !== undefined) createBody.members = members;

        // createGroup returns TEReader<Group> (already decoded)
        const te = createGroup(createBody as any)(ctx);

        const result = await pipe(
          te,
          fp.TE.mapLeft((err) => {
            ctx.logger.error.log("createGroup error: %O", err);
            return err;
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
              text: JSON.stringify({
                group: groupToOutput(result.right as Group),
              }),
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

  // --- editGroup ---
  const editGroupInputSchema = effectToZodStruct(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "Group UUID (required)",
      }),
      name: Schema.UndefinedOr(Schema.String).annotations({
        description: "New group name",
      }),
      username: Schema.UndefinedOr(Schema.String).annotations({
        description: "New unique username",
      }),
      color: Schema.UndefinedOr(Schema.String).annotations({
        description: "New color in hex format without #",
      }),
      kind: Schema.UndefinedOr(
        Schema.Union(Schema.Literal("Public"), Schema.Literal("Private")),
      ).annotations({
        description: "New visibility type (Public or Private)",
      }),
      excerpt: Schema.UndefinedOr(Schema.Any).annotations({
        description: "New short description",
      }),
      body: Schema.UndefinedOr(Schema.Any).annotations({
        description: "New full description",
      }),
      startDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "New start date (ISO 8601 string)",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "New end date (ISO 8601 string)",
      }),
      members: Schema.UndefinedOr(
        Schema.Array(Schema.Union(Schema.String, Schema.Any)),
      ).annotations({
        description: "New member list (array of actor UUIDs or member objects)",
      }),
    }),
  );

  server.registerTool(
    EDIT_GROUP,
    {
      title: "Edit group",
      description: "Edit an existing group in the database.",
      annotations: { title: "Edit group" },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: editGroupInputSchema as unknown as {
        id: any;
        name?: any;
        username?: any;
        color?: any;
        kind?: any;
        excerpt?: any;
        body?: any;
        startDate?: any;
        endDate?: any;
        members?: any;
      },
    },
    async (opts) => {
      const {
        id,
        name,
        username,
        color,
        kind,
        excerpt,
        body,
        startDate,
        endDate,
        members,
      } = opts ?? {};

      try {
        if (!id) {
          throw new Error("Group id is required for editing");
        }

        const editBody: Record<string, unknown> = { id };
        if (name !== undefined) editBody.name = name;
        if (username !== undefined) editBody.username = username;
        if (color !== undefined) editBody.color = color;
        if (kind !== undefined) editBody.kind = kind;
        if (excerpt !== undefined) editBody.excerpt = excerpt;
        if (body !== undefined) editBody.body = body;
        if (startDate !== undefined) editBody.startDate = new Date(startDate);
        if (endDate !== undefined) editBody.endDate = new Date(endDate);
        if (members !== undefined) editBody.members = members;

        // editGroup returns TEReader<GroupEntity>, decode with GroupIO
        const te = editGroup(editBody as any)(ctx);

        const result = await pipe(
          te,
          fp.TE.chainEitherK((g) => GroupIO.decodeSingle(g as any)),
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
};
