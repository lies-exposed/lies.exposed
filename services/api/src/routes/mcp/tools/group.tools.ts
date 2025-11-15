import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
import {
  CREATE_GROUP,
  EDIT_GROUP,
  FIND_GROUPS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchGroups } from "@liexp/backend/lib/queries/groups/fetchGroups.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import type { AddGroupBody } from "@liexp/shared/lib/io/http/Group.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { createGroup } from "../../../flows/groups/createGroup.flow.js";
import { editGroup } from "../../../flows/groups/editGroup.flow.js";
import { formatGroupToMarkdown } from "./formatters/groupToMarkdown.formatter.js";

export const registerGroupTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_GROUPS,
    {
      title: "Find groups",
      description:
        "Search for groups using various criteria like name or keywords. Returns the groups in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.String.annotations({
            description:
              "Search query string to filter groups by name or description",
          }),
          withDeleted: Schema.UndefinedOr(Schema.Boolean).annotations({
            description: "Include deleted groups in the search results",
          }),
          sort: Schema.Union(
            Schema.Union(Schema.Literal("createdAt"), Schema.Literal("name")),
            Schema.Undefined,
          ).annotations({
            description:
              'Sort field: "createdAt" or "name". Defaults to createdAt',
          }),
          order: Schema.Union(
            Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
            Schema.Undefined,
          ).annotations({
            description:
              'Sort order: "ASC" for ascending or "DESC" for descending',
          }),
        }),
      ),
    },
    async ({ query, withDeleted: _withDeleted, sort, order }) => {
      return pipe(
        fetchGroups({
          q: O.fromNullable(query),
          _sort: O.fromNullable(sort),
          _order: O.fromNullable(order),
        }),
        LoggerService.RTE.debug(`Results %O`),
        fp.RTE.chainEitherK((result) => GroupIO.decodeMany(result[0])),
        fp.RTE.map((groups) => {
          if (groups.length === 0) {
            return {
              content: [
                {
                  text: `No groups found matching the search criteria${query ? ` for "${query}"` : ""}.`,
                  type: "text" as const,
                },
              ],
            };
          }
          return {
            content: groups.map((group) => ({
              text: formatGroupToMarkdown(group),
              type: "text" as const,
              href: `group://${group.id}`,
            })),
          };
        }),
        (rte) => throwTE(rte(ctx)),
      );
    },
  );

  const createInputSchema = effectToZodStruct(
    Schema.Struct({
      name: Schema.String.annotations({
        description: "Name of the group",
      }),
      username: Schema.String.annotations({
        description: "Unique username for the group",
      }),
      color: Schema.String.annotations({
        description: "Color associated with the group (hex format, without #)",
      }),
      kind: Schema.Union(
        Schema.Literal("Public"),
        Schema.Literal("Private"),
      ).annotations({
        description: "Whether the group is Public or Private",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description: "Short description of the group as plain text or null",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full body content as plain text or null",
      }),
      avatar: Schema.UndefinedOr(UUID).annotations({
        description: "Avatar media UUID or null",
      }),
      startDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Group start date in ISO format (YYYY-MM-DD) or null",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Group end date in ISO format (YYYY-MM-DD) or null",
      }),
      // members: Schema.Array(
      //   Schema.Struct({
      //     actor: UUID.annotations({ description: "Actor UUID" }),
      //     body: Schema.String.annotations({
      //       description: "Member description",
      //     }),
      //     startDate: Schema.String.annotations({
      //       description: "Member start date in ISO format (YYYY-MM-DD)",
      //     }),
      //     endDate: Schema.UndefinedOr(Schema.String).annotations({
      //       description: "Member end date in ISO format (YYYY-MM-DD) or null",
      //     }),
      //   }),
      // ).annotations({
      //   description: "Array of group members",
      // }),
    }),
  );

  server.registerTool(
    CREATE_GROUP,
    {
      title: "Create group",
      description:
        "Create a new group (organization) in the database with the provided information. Returns the created group details in structured markdown format.",
      annotations: { title: "Create group", tool: true },
      inputSchema: createInputSchema,
    },
    async ({
      name,
      username,
      color,
      kind,
      excerpt,
      body,
      avatar,
      startDate,
      endDate,
      // members,
    }) => {
      const groupBody: AddGroupBody = {
        name,
        username,
        color,
        kind,
        excerpt: excerpt ? toInitialValue(excerpt) : undefined,
        body: body ? toInitialValue(body) : undefined,
        avatar: avatar ?? undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        // members: (members ?? []).map((member) => ({
        //   actor: member.actor,
        //   body: toInitialValue(member.body),
        //   startDate: new Date(member.startDate),
        //   endDate: member.endDate ? O.some(new Date(member.endDate)) : O.none(),
        // })),
        members: [],
      };

      return pipe(
        createGroup(groupBody)(ctx),
        LoggerService.TE.debug(ctx, "Created group %O"),
        fp.TE.map((group) => {
          if ("success" in group) {
            return {
              content: [
                {
                  text: "Group creation process initiated successfully.",
                  type: "text" as const,
                },
              ],
            };
          }

          return {
            content: [
              {
                text: formatGroupToMarkdown(group),
                type: "text" as const,
                href: `group://${group.id}`,
              },
            ],
          };
        }),
        throwTE,
      );
    },
  );

  const editInputSchema = effectToZodStruct(
    Schema.Struct({
      id: UUID.annotations({
        description: "UUID of the group to edit",
      }),
      name: Schema.UndefinedOr(Schema.String).annotations({
        description: "Name of the group or null to keep current",
      }),
      username: Schema.UndefinedOr(Schema.String).annotations({
        description: "Unique username for the group or null to keep current",
      }),
      color: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Color associated with the group (hex format, without #) or null to keep current",
      }),
      kind: Schema.UndefinedOr(
        Schema.Union(Schema.Literal("Public"), Schema.Literal("Private")),
      ).annotations({
        description:
          "Whether the group is Public or Private or null to keep current",
      }),
      excerpt: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Short description of the group as plain text or null to keep current",
      }),
      body: Schema.UndefinedOr(Schema.String).annotations({
        description: "Full body content as plain text or null to keep current",
      }),
      avatar: Schema.UndefinedOr(UUID).annotations({
        description: "Avatar media UUID or null to keep current",
      }),
      startDate: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Group start date in ISO format (YYYY-MM-DD) or null to keep current",
      }),
      endDate: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Group end date in ISO format (YYYY-MM-DD) or null to keep current",
      }),
      members: Schema.Array(UUID).annotations({
        description: "Array of group members or null to keep current",
      }),
    }),
  );

  server.registerTool(
    EDIT_GROUP,
    {
      title: "Edit group",
      description:
        "Edit an existing group (organization) in the database with the provided information. Only provided fields will be updated. Returns the updated group details in structured markdown format.",
      annotations: { title: "Edit group", tool: true },
      inputSchema: editInputSchema,
    },
    async ({
      id,
      name,
      username,
      color,
      kind,
      excerpt,
      body,
      avatar,
      startDate,
      endDate,
      members,
    }) => {
      return pipe(
        editGroup({
          id,
          name: O.fromNullable(name),
          username: O.fromNullable(username),
          color: O.fromNullable(color),
          kind: O.fromNullable(kind),
          excerpt: pipe(
            O.fromNullable(excerpt),
            O.map((e) => toInitialValue(e)),
          ),
          body: pipe(
            O.fromNullable(body),
            O.map((b) => toInitialValue(b)),
          ),
          avatar: O.fromNullable(avatar),
          startDate: O.fromNullable(startDate),
          endDate: O.fromNullable(endDate),
          members: pipe(
            O.fromNullable(members),
            O.filter((m) => m.length > 0),
          ),
        })(ctx),
        LoggerService.TE.debug(ctx, "Updated group %O"),
        fp.TE.map((group) => ({
          content: [
            {
              text: formatGroupToMarkdown(group),
              type: "text" as const,
              href: `group://${group.id}`,
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
