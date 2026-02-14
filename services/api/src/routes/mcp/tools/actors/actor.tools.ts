import {
  CREATE_ACTOR,
  EDIT_ACTOR,
  FIND_ACTORS,
  GET_ACTOR,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import {
  CreateActorInputSchema,
  createActorToolTask,
} from "./createActor.tool.js";
import { EditActorInputSchema, editActorToolTask } from "./editActor.tool.js";
import {
  FindActorsInputSchema,
  findActorsToolTask,
} from "./findActors.tool.js";
import { GetActorInputSchema, getActorToolTask } from "./getActor.tool.js";

export const registerActorTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_ACTORS,
    {
      title: "Find actors",
      description: `Search for persons in the database by name or group membership. ALWAYS search before creating.

SEARCH STRATEGY - Always try multiple name variations to find duplicates:

For "Donald Trump":
- Search: "Donald Trump" (full name)
- Search: "Trump" (last name only)
- Search: "Donald" (first name only)
- Search: "D. Trump" (initial)
- Search: "The Donald" (alias if known)

For "World leaders":
- Search with full name first
- Then shortened variations
- Then nicknames (if known)
- Check results across searches

SEARCH CRITERIA:
- fullName: Search by name (partial match supported)
- memberIn: Filter by group UUIDs (actors in organizations)
- withDeleted: Include deleted actors
- sort: username, createdAt (default), updatedAt
- order: ASC or DESC

CRITICAL TIPS:
- ALWAYS search multiple times before creating
- Try acronyms, abbreviated names, nicknames
- Returns full actor details (name, username, bio, dates, groups)
- Duplicate entries fragment information`,
      annotations: { title: "Find actors" },
      inputSchema: effectToZodStruct(FindActorsInputSchema),
    },
    (input) => pipe(findActorsToolTask(input), throwRTE(ctx)),
  );

  server.registerTool(
    GET_ACTOR,
    {
      title: "Get actor",
      description:
        "Retrieve an actor (person) by its ID. Returns the actor details in structured markdown format.",
      annotations: { title: "Get actor" },
      inputSchema: effectToZodStruct(GetActorInputSchema),
    },
    flow(getActorToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_ACTOR,
    {
      title: "Create actor",
      description: `Create a new actor (person) in the database with simplified parameters.

CRITICAL WORKFLOW - ALWAYS SEARCH FIRST:
1. Use findActors to search with multiple name variations
2. Only create if NO match found
3. For nationalities: Search using findNations to get UUIDs

REQUIRED FIELDS:
- username: Unique identifier (lowercase, no spaces)
- fullName: Display name

OPTIONAL CONFIGURATION (in config):
All optional fields use smart defaults if omitted:
- color: Auto-generated random color if not specified
- excerpt: Short description (null if not provided)
- nationalityIds: Array of nationality UUIDs (empty if not provided)
- body: Full biography (null if not provided)
- avatar: Media UUID (null if not provided)
- bornOn: Birth date YYYY-MM-DD (null if unknown)
- diedOn: Death date YYYY-MM-DD (null if unknown)

EXAMPLES:

Example 1 - Minimal actor:
{
  "username": "john_smith",
  "fullName": "John Smith"
}
→ Creates actor with random color, no other details

Example 2 - Actor with details:
{
  "username": "jane_doe",
  "fullName": "Jane Doe",
  "config": {
    "color": "FF10F0",
    "excerpt": "American businesswoman",
    "nationalityIds": ["usa-nation-uuid"],
    "avatar": "media-uuid-123",
    "bornOn": "1975-03-15"
  }
}

NOTES:
- ALWAYS search before creating to avoid duplicates
- Only provide config fields you have values for
- System generates random color automatically
- Avatar media must already exist in database`,
      annotations: { title: "Create actor" },
      inputSchema: effectToZodStruct(CreateActorInputSchema),
    },
    (input) => pipe(createActorToolTask(input), throwRTE(ctx)),
  );

  server.registerTool(
    EDIT_ACTOR,
    {
      title: "Edit actor",
      description:
        "Update an existing actor with new information. IMPORTANT: Always search for the actor using findActors BEFORE editing to verify it exists. For nationalities, use findNations tool to get the correct nationality UUIDs. Returns the updated actor details in structured markdown format.",
      annotations: { title: "Edit actor" },
      inputSchema: effectToZodStruct(EditActorInputSchema),
    },
    (input) =>
      pipe(
        editActorToolTask({
          ...input,
          username: input.username ?? undefined,
          fullName: input.fullName ?? undefined,
          color: input.color ?? undefined,
          excerpt: input.excerpt ?? undefined,
          body: input.body ?? undefined,
          avatar: input.avatar ?? undefined,
          bornOn: input.bornOn ?? undefined,
          diedOn: input.diedOn ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );
};
