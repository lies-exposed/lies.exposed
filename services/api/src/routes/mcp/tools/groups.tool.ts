import { GroupMemberEntity } from "@liexp/backend/lib/entities/GroupMember.entity.js";
import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import { GroupMemberIO } from "@liexp/backend/lib/io/groupMember.io.js";
import {
  CREATE_GROUP,
  CREATE_GROUP_MEMBER,
  EDIT_GROUP,
  FIND_GROUPS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import {
  EditGroupBody,
  type CreateGroupBody,
  type Group,
} from "@liexp/io/lib/http/Group.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { Equal } from "typeorm";
import { defineMcpTool } from "./helpers.js";
import type { ServerContext } from "#context/context.type.js";
import { createGroup } from "#flows/groups/createGroup.flow.js";
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
  const findGroupsTool = defineMcpTool(
    Schema.Struct({
      query: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Search query string to filter groups by name, excerpt, or body",
      }),
      ids: Schema.optional(Schema.Array(Schema.String)).annotations({
        description:
          "Fetch specific groups by UUID (use this to get a record by id)",
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
      const { query, ids, sort, order, start, end } = input;

      // fetchGroups reads effect Options; plain values would be ignored
      const groupQuery: Record<string, unknown> = {};
      if (query) {
        groupQuery.q = O.some(query);
      }
      if (ids && ids.length > 0) {
        groupQuery.ids = O.some(ids);
      }
      if (sort) {
        groupQuery._sort = O.some(sort);
      }
      if (order) {
        groupQuery._order = O.some(order);
      }
      if (start !== undefined) {
        groupQuery._start = O.some(Number(start));
      }
      if (end !== undefined) {
        groupQuery._end = O.some(Number(end));
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
        const createBody = {
          name: input.name,
          username: input.username,
          color: input.color,
          kind: input.kind ?? "Public",
          excerpt: toInitialValue(input.excerpt),
          body: toInitialValue(input.body),
          startDate: input.startDate ? new Date(input.startDate) : undefined,
          endDate: input.endDate ? new Date(input.endDate) : undefined,
          avatar: input.avatar as UUID | undefined,
          members: input.members ?? [],
        } satisfies CreateGroupBody;

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
      avatar: Schema.UndefinedOr(Schema.String).annotations({
        description: "New avatar media UUID",
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
        description:
          "New member list. Strings are EXISTING group-member row UUIDs (not actor ids). To add a member pass { actor: <actor UUID>, startDate: YYYY-MM-DD, endDate?: YYYY-MM-DD | null, body?: text }. Omit to keep current.",
      }),
    }),
    async (input) => {
      try {
        // Decode through the flow's body schema so every optional field becomes
        // an Option and member objects get Option-wrapped body/endDate and Date
        // startDate. String members are existing group-member row UUIDs.
        const members = input.members?.map((m) =>
          typeof m === "string" || typeof m !== "object" || m === null
            ? m
            : {
                ...m,
                body: toInitialValue((m as { body?: unknown }).body),
              },
        );

        const decoded = Schema.decodeUnknownEither(EditGroupBody)({
          name: input.name,
          username: input.username,
          color: input.color,
          kind: input.kind,
          excerpt: toInitialValue(input.excerpt),
          body: toInitialValue(input.body),
          avatar: input.avatar,
          startDate: input.startDate,
          endDate: input.endDate,
          members,
        });

        if (fp.E.isLeft(decoded)) {
          throw new Error(`Invalid editGroup input: ${decoded.left.message}`);
        }

        const editBody = { ...decoded.right, id: input.id as UUID };

        const result = await pipe(
          editGroup(editBody),
          fp.RTE.mapLeft((err) => {
            ctx.logger.error.log("editGroup error: %O", err);
            return err;
          }),
          throwRTE(ctx),
        ).catch((err) => {
          throw new Error((err as Error).message ?? "Failed to edit group");
        });

        return {
          content: [
            {
              text: JSON.stringify({ group: groupToOutput(result) }),
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

  // --- createGroupMember ---
  const createGroupMemberTool = defineMcpTool(
    Schema.Struct({
      group: Schema.String.annotations({
        description: "Group UUID (required)",
      }),
      actor: Schema.String.annotations({
        description: "Actor UUID of the member (required)",
      }),
      startDate: Schema.String.annotations({
        description: "Membership start date, ISO 8601 (YYYY-MM-DD) (required)",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Membership end date, ISO 8601; omit if still active",
      }),
      body: Schema.UndefinedOr(Schema.Unknown).annotations({
        description:
          "Description of the membership (e.g. role). Plain text or a BlockNote document",
      }),
    }),
    async (input) => {
      try {
        const startDate = new Date(input.startDate);
        const endDate = input.endDate ? new Date(input.endDate) : null;
        if (
          Number.isNaN(startDate.getTime()) ||
          (endDate !== null && Number.isNaN(endDate.getTime()))
        ) {
          throw new Error("startDate/endDate must be valid ISO 8601 dates");
        }

        const result = await pipe(
          ctx.db.save(GroupMemberEntity, [
            {
              group: { id: input.group },
              actor: { id: input.actor },
              startDate,
              endDate,
              body: toInitialValue(input.body) ?? null,
            },
          ]),
          fp.TE.chain(([m]) =>
            ctx.db.findOneOrFail(GroupMemberEntity, {
              where: { id: Equal(m.id) },
              relations: { actor: true, group: true },
            }),
          ),
          fp.TE.chainEitherK((m) => GroupMemberIO.decodeSingle(m)),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create group member",
          );
        }

        const m = result.right;
        return {
          content: [
            {
              text: JSON.stringify({
                groupMember: {
                  id: m.id,
                  group: m.group.id,
                  actor: m.actor.id,
                  startDate: m.startDate,
                  endDate: m.endDate,
                  body: m.body,
                },
              }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("createGroupMember error: %O", err);
        throw new Error(
          `Failed to create group member: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    CREATE_GROUP_MEMBER,
    {
      title: "Create group member",
      description:
        "Add an actor to a group as a member (creates the membership). Provide the group UUID, actor UUID and start date; optionally end date and a body describing the role.",
      annotations: { title: "Create group member", destructiveHint: false },
      inputSchema: createGroupMemberTool.inputSchema,
    },
    createGroupMemberTool.handler,
  );
};
