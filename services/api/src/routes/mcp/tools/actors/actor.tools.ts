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
      description:
        "Search for persons by name or group membership. Supports partial name matching, group filtering, and sorting.",
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
      description:
        "Create a new actor. Use findActors to search first and avoid duplicates. Optional config fields: color, excerpt, nationalityIds, body, avatar, bornOn, diedOn.",
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
        "Update an actor. Only provide fields to change; omitted fields keep current values. Empty arrays clear membership; dates can be cleared by omitting.",
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
