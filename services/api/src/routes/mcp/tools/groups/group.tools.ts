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
      description: `Search for groups (organizations) using various criteria.

SEARCH STRATEGY - Always try multiple name variations:

For "World Health Organization":
- Search 1: "World Health Organization"
- Search 2: "WHO"
- Search 3: "Health Organization"

For "European Union":
- Search 1: "European Union"
- Search 2: "EU"
- Search 3: "E.U."

TIPS:
- Use name parameter for organization names
- Try acronyms and abbreviated forms
- Try partial name matches
- Returns results in structured markdown format
- ALWAYS search before creating new group to avoid duplicates`,
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
      description:
        "Retrieve detailed information about a specific group (organization) using its unique identifier. Returns the group details in structured markdown format.",
      inputSchema: effectToZodStruct(GetGroupInputSchema),
      annotations: { title: "Get group" },
    },
    flow(getGroupToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_GROUP,
    {
      title: "Create group",
      description: `Create a new group (organization) in the database with simplified parameters.

CRITICAL WORKFLOW - ALWAYS SEARCH FIRST:
1. Use findGroups to search with multiple name variations
2. Only create if NO match found
3. For members: Search using findActors to get member UUIDs

REQUIRED FIELDS:
- name: Organization name
- username: Unique identifier (lowercase, no spaces)
- kind: Organization type (Public or Private)

OPTIONAL CONFIGURATION (in config):
All optional fields use smart defaults if omitted:
- color: Auto-generated random color if not specified
- excerpt: Short description (null if not provided)
- body: Full details (null if not provided)
- avatar: Media UUID (null if not provided)
- startDate: Start date YYYY-MM-DD (null if unknown)
- endDate: End date YYYY-MM-DD (null if unknown)

EXAMPLES:

Example 1 - Minimal group:
{
  "name": "World Health Organization",
  "username": "world_health_org",
  "kind": "Public"
}
→ Creates organization with random color, no other details

Example 2 - Group with details:
{
  "name": "ABC Company",
  "username": "abc_company",
  "kind": "Private",
  "config": {
    "color": "0077BE",
    "excerpt": "Tech company founded in 2010",
    "avatar": "media-uuid-123",
    "startDate": "2010-05-20"
  }
}

NOTES:
- ALWAYS search before creating to avoid duplicates
- Only provide config fields you have values for
- System generates random color automatically
- Avatar media must already exist in database`,
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
