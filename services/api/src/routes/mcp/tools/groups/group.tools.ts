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
      description: `Create a new group (organization) in the database.

CRITICAL WORKFLOW - ALWAYS DO THIS FIRST:
1. Search using findGroups with multiple name variations:
   - Full name: "World Health Organization"
   - Acronym: "WHO"
   - Short form: "W.H.O."
   - Alternative: "Health Organization"
2. Only create if NO match found in search results
3. For members: Search using findActors to get member actor UUIDs

PARAMETER GUIDELINES:
- username: Unique identifier (no spaces, lowercase recommended)
- name: Display name (e.g., "World Health Organization")
- color: Hex color without # (e.g., "FF5733") - system generates random if needed
- kind: Organization type (e.g., "NGO", "Government", "Company", "Academic")
- avatar: Must be existing media UUID - omit if no media available
- startDate/endDate: ISO format YYYY-MM-DD or omit if unknown
- members: Array of actor UUIDs from findActors

EXAMPLE - Complete group:
{
  "username": "world_health_org",
  "name": "World Health Organization",
  "color": "0077BE",
  "kind": "International NGO",
  "excerpt": "UN agency for public health",
  "body": null,
  "avatar": "media-uuid-1",
  "startDate": "1948-04-07",
  "endDate": null,
  "members": ["actor-uuid-1", "actor-uuid-2"]
}

EXAMPLE - Minimal group:
{
  "username": "company_abc",
  "name": "ABC Company",
  "color": "FF5733",
  "kind": "Company",
  "excerpt": null,
  "body": null,
  "avatar": null,
  "startDate": null,
  "endDate": null,
  "members": []
}

NOTES:
- Always search BEFORE creating to avoid duplicates
- Empty arrays/nulls are acceptable for optional fields
- Use exact member UUIDs from search results
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
