import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import {
  CREATE_GROUP,
  EDIT_GROUP,
  FIND_GROUPS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type CreateGroupBody, type Group } from "@liexp/io/lib/http/Group.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
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

const wrap = <A>(a: A | undefined): O.Option<A> => O.fromNullable(a);

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
        description: "New member list (array of actor UUIDs or member objects)",
      }),
    }),
    async (input) => {
      try {
        // Build EditGroupInput for the editGroup flow. MCP input uses plain
        // optional fields while the flow takes Option-wrapped, branded fields;
        // each value is wrapped and leaf-cast (no `any`, no double cast) and the
        // flow validates member/date/document shapes at runtime.
        const editBody = {
          id: input.id as UUID,
          name: wrap(input.name),
          username: wrap(input.username),
          color: wrap(input.color),
          kind: wrap(input.kind),
          excerpt: wrap(input.excerpt as BlockNoteDocument | null),
          body: wrap(input.body as BlockNoteDocument | null),
          avatar: wrap(input.avatar as UUID | null),

          startDate: wrap(input.startDate),
          endDate: wrap(input.endDate),
          members: wrap(
            input.members as readonly (
              | UUID
              | {
                  actor: UUID;
                  body: O.Option<BlockNoteDocument | null>;
                  startDate: Date;
                  endDate: O.Option<Date | null>;
                }
            )[],
          ),
        };

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
};
