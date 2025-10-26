import { GroupIO } from "@liexp/backend/lib/io/group.io.js";
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
import { formatGroupToMarkdown } from "./formatters/groupToMarkdown.formatter.js";

export const registerGroupTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    "findGroups",
    {
      title: "Find groups",
      description:
        "Search for groups using various criteria like name or keywords. Returns the groups in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.String,
          withDeleted: Schema.Union(Schema.Boolean, Schema.Undefined),
          sort: Schema.Union(
            Schema.Union(Schema.Literal("createdAt"), Schema.Literal("name")),
            Schema.Undefined,
          ),
          order: Schema.Union(
            Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
            Schema.Undefined,
          ),
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
      excerpt: Schema.NullOr(Schema.String).annotations({
        description: "Short description of the group as plain text or null",
      }),
      body: Schema.NullOr(Schema.String).annotations({
        description: "Full body content as plain text or null",
      }),
      avatar: Schema.NullOr(UUID).annotations({
        description: "Avatar media UUID or null",
      }),
      startDate: Schema.NullOr(Schema.String).annotations({
        description: "Group start date in ISO format (YYYY-MM-DD) or null",
      }),
      endDate: Schema.NullOr(Schema.String).annotations({
        description: "Group end date in ISO format (YYYY-MM-DD) or null",
      }),
      members: Schema.Array(
        Schema.Struct({
          actor: UUID.annotations({ description: "Actor UUID" }),
          body: Schema.String.annotations({
            description: "Member description",
          }),
          startDate: Schema.String.annotations({
            description: "Member start date in ISO format (YYYY-MM-DD)",
          }),
          endDate: Schema.NullOr(Schema.String).annotations({
            description: "Member end date in ISO format (YYYY-MM-DD) or null",
          }),
        }),
      ).annotations({
        description: "Array of group members",
      }),
    }),
  );

  server.registerTool(
    "createGroup",
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
      members,
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
        members: (members ?? []).map((member) => ({
          actor: member.actor,
          body: toInitialValue(member.body),
          startDate: new Date(member.startDate),
          endDate: member.endDate ? O.some(new Date(member.endDate)) : O.none(),
        })),
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
};
