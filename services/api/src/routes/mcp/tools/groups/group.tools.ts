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
        "Search for groups (organizations) using various criteria like name or keywords. ALWAYS use this tool BEFORE creating a new group to check if the organization already exists. Try multiple search variations (full name, abbreviations, acronyms). Returns the groups in JSON format.",
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
        "Create a new group (organization) in the database with the provided information. IMPORTANT: Always search for existing groups using findGroups with multiple name variations (full name, abbreviations, acronyms like 'WHO' for 'World Health Organization') BEFORE creating a new group to avoid duplicates. Only create if no match exists. Returns the created group details in structured markdown format.",
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
        "Edit an existing group (organization) in the database with the provided information. Only provided fields will be updated. Returns the updated group details in structured markdown format.",
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
};
