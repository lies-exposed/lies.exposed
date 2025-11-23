import {
  CREATE_GROUP,
  EDIT_GROUP,
  FIND_GROUPS,
  GET_GROUP,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { createGroupToolTask, CreateInputSchema } from "./createGroup.tool.js";
import { editGroupToolTask, EditInputSchema } from "./editGroup.tool.js";
import {
  FindGroupsInputSchema,
  findGroupsToolTask,
} from "./findGroups.tool.js";
import { GetGroupInputSchema, getGroupToolTask } from "./getGroup.tool.js";

export const registerGroupTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_GROUPS,
    {
      title: "Find groups",
      description:
        "Search for groups using various criteria like name or keywords. Returns the groups in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(FindGroupsInputSchema),
    },
    (input) =>
      pipe(
        findGroupsToolTask({
          sort: "createdAt",
          order: "ASC",
          withDeleted: undefined,
          ...input,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    GET_GROUP,
    {
      title: "Get group",
      inputSchema: effectToZodStruct(GetGroupInputSchema),
      annotations: { title: "Get group", tool: true },
    },
    flow(getGroupToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_GROUP,
    {
      title: "Create group",
      description:
        "Create a new group (organization) in the database with the provided information. Returns the created group details in structured markdown format.",
      annotations: { title: "Create group", tool: true },
      inputSchema: effectToZodStruct(CreateInputSchema),
    },
    (input) =>
      pipe(
        createGroupToolTask({
          startDate: undefined,
          endDate: undefined,
          avatar: undefined,
          ...input,
          body: input.body ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    EDIT_GROUP,
    {
      title: "Edit group",
      description:
        "Edit an existing group (organization) in the database with the provided information. Only provided fields will be updated. Returns the updated group details in structured markdown format.",
      annotations: { title: "Edit group", tool: true },
      inputSchema: effectToZodStruct(EditInputSchema),
    },
    (input) =>
      pipe(
        editGroupToolTask({
          id: input.id,
          name: input.name,
          username: input.username,
          color: input.color,
          kind: input.kind,
          excerpt: input.excerpt,
          body: input.body,
          avatar: input.avatar,
          startDate: input.startDate,
          endDate: input.endDate,
          members: input.members,
        }),
        throwRTE(ctx),
      ),
  );
};
