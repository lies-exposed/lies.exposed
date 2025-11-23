import {
  CREATE_ACTOR,
  EDIT_ACTOR,
  FIND_ACTORS,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import {
  CreateActorInputSchema,
  createActorToolTask,
} from "./actors/createActor.tool.js";
import {
  EditActorInputSchema,
  editActorToolTask,
} from "./actors/editActor.tool.js";
import {
  FindActorsInputSchema,
  findActorsToolTask,
} from "./actors/findActors.tool.js";

export const registerActorTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_ACTORS,
    {
      title: "Find actors",
      description:
        "Search for persons in DB using various criteria like full name, username, or associated keywords. Returns the actor details in structured markdown format that is optimized for LLM understanding",
      annotations: { title: "Find actor", tool: true },
      inputSchema: effectToZodStruct(FindActorsInputSchema),
    },
    (input) =>
      pipe(
        findActorsToolTask({
          fullName: undefined,
          memberIn: [],
          withDeleted: undefined,
          sort: undefined,
          order: undefined,
          start: undefined,
          end: undefined,
          ...input,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    CREATE_ACTOR,
    {
      title: "Create actor",
      description:
        "Create a new actor (person) in the database with the provided information. Returns the created actor details in structured markdown format.",
      annotations: { title: "Create actor", tool: true },
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
        "Edit an existing actor (person) in the database with the provided information. Only provided fields will be updated. Returns the updated actor details in structured markdown format.",
      annotations: { title: "Edit actor", tool: true },
      inputSchema: effectToZodStruct(EditActorInputSchema),
    },
    flow(editActorToolTask, throwRTE(ctx)),
  );
};
