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
      description: `Search for persons in the database using various criteria.

SEARCH STRATEGY - Always try multiple name variations:

For "Donald Trump":
- Search 1: "Donald Trump"
- Search 2: "Trump"
- Search 3: "D. Trump"
- Search 4: "Donald J Trump"

For "World leaders":
- Search with full name first
- Then try shortened name
- Then try nickname if known

TIPS:
- Use fullName parameter for exact or partial name matches
- Use memberIn parameter to find actors in specific groups/organizations
- Try multiple searches with name variations
- Returns results in structured markdown format
- ALWAYS search before creating new actor to avoid duplicates`,
      annotations: { title: "Find actor" },
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
      description: `Create a new actor (person) in the database.

CRITICAL WORKFLOW - ALWAYS DO THIS FIRST:
1. Search using findActors with multiple name variations:
   - Full name: "John Smith"
   - Nickname: "Johnny Smith"
   - Abbreviation: "J. Smith"
   - Alternative spellings: "Jon Smith"
2. Only create if NO match found in search results
3. For nationalities: Use findNations and get the correct UUIDs

PARAMETER GUIDELINES:
- username: Unique identifier (no spaces, lowercase recommended)
- fullName: Display name (e.g., "John Smith")
- color: Hex color without # (e.g., "FF5733") - system generates random if needed
- avatar: Must be existing media UUID - omit if no media available
- bornOn/diedOn: ISO format YYYY-MM-DD or omit if unknown
- nationalities: Array of nationality UUIDs from findNations

EXAMPLE - Minimal actor:
{
  "username": "john_smith",
  "fullName": "John Smith",
  "color": "0084FF",
  "nationalities": ["nation-uuid-1"],
  "excerpt": "American businessman and entrepreneur",
  "body": null,
  "avatar": "media-uuid-1",
  "bornOn": "1960-06-14",
  "diedOn": null
}

EXAMPLE - Actor with minimal fields:
{
  "username": "jane_doe",
  "fullName": "Jane Doe",
  "color": "FF10F0",
  "nationalities": [],
  "excerpt": null,
  "body": null,
  "avatar": null,
  "bornOn": null,
  "diedOn": null
}

NOTES:
- Always search BEFORE creating to avoid duplicates
- Empty arrays/nulls are acceptable for optional fields
- Use exact nationality UUIDs from search results
- Avatar media must already exist in database`,
      annotations: { title: "Create actor" },
      inputSchema: effectToZodStruct(CreateActorInputSchema),
    },
    (input) =>
      pipe(
        createActorToolTask({
          username: input.username,
          fullName: input.fullName,
          color: input.color,
          excerpt: input.excerpt,
          nationalities: input.nationalities,
          body: input.body,
          avatar: input.avatar,
          bornOn: input.bornOn,
          diedOn: input.diedOn,
        }),
        throwRTE(ctx),
      ),
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
