import {
  CREATE_GROUP,
  EDIT_GROUP,
  FIND_GROUPS,
  GET_GROUP,
  FIND_GROUP_AVATAR,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { createGroupToolTask, CreateInputSchema } from "./createGroup.tool.js";
import { editGroupToolTask, EditInputSchema } from "./editGroup.tool.js";
import {
  FindGroupAvatarInputSchema,
  findGroupAvatarToolTask,
} from "./findGroupAvatar.tool.js";
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
        "Search for organizations by name or criteria. Supports partial name matching, acronyms, and sorting.",
      annotations: { title: "Find groups" },
      inputSchema: effectToZodStruct(FindGroupsInputSchema),
    },
    (input) =>
      pipe(
        findGroupsToolTask({
          ...input,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    GET_GROUP,
    {
      title: "Get group",
      description: "Retrieve a group by ID.",
      inputSchema: effectToZodStruct(GetGroupInputSchema),
      annotations: { title: "Get group" },
    },
    flow(getGroupToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_GROUP,
    {
      title: "Create group",
      description:
        "Create a new group. Use findGroups to search first and avoid duplicates. Optional config fields: color, excerpt, body, avatar, startDate, endDate.",
      annotations: { title: "Create group" },
      inputSchema: effectToZodStruct(CreateInputSchema),
    },
    (input) =>
      pipe(
        createGroupToolTask({
          ...input,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    EDIT_GROUP,
    {
      title: "Edit group",
      description:
        "Update a group. Only provide fields to change; omitted fields keep current values. Empty arrays clear membership; dates can be cleared by omitting.",
      annotations: { title: "Edit group" },
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

  server.registerTool(
    FIND_GROUP_AVATAR,
    {
      title: "Find group avatar",
      description:
        "Search Wikipedia for a group/organization and retrieve its profile image. Returns media ID for use with createGroup.",
      annotations: { title: "Find group avatar" },
      inputSchema: effectToZodStruct(FindGroupAvatarInputSchema),
    },
    (input) =>
      pipe(
        findGroupAvatarToolTask({
          ...input,
        }),
        throwRTE(ctx),
      ),
  );
};
