import {
  CREATE_AREA,
  EDIT_AREA,
  FIND_AREAS,
  GET_AREA,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import {
  CreateAreaInputSchema,
  createAreaToolTask,
} from "./createArea.tool.js";
import { EditAreaInputSchema, editAreaToolTask } from "./editArea.tool.js";
import { FindAreasInputSchema, findAreasToolTask } from "./findAreas.tool.js";
import { GetAreaInputSchema, getAreaToolTask } from "./getArea.tool.js";

export const registerAreaTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_AREAS,
    {
      title: "Find area",
      description:
        "Search for areas using various criteria like name or keywords. Returns the area in JSON format",
      annotations: { title: "Find areas" },
      inputSchema: effectToZodStruct(FindAreasInputSchema),
    },
    (input) =>
      pipe(
        findAreasToolTask({
          query: input.query,
          withDeleted: input.withDeleted,
          sort: input.sort,
          order: input.order,
          start: input.start,
          end: input.end,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    GET_AREA,
    {
      title: "Get area",
      description:
        "Retrieve an area by its ID. Returns the area details in structured markdown format.",
      annotations: { title: "Get area" },
      inputSchema: effectToZodStruct(GetAreaInputSchema),
    },
    flow(getAreaToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_AREA,
    {
      title: "Create area",
      description:
        "Create a new geographic area in the database with the provided information. Returns the created area details in structured markdown format.",
      annotations: { title: "Create area" },
      inputSchema: effectToZodStruct(CreateAreaInputSchema),
    },
    flow(createAreaToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    EDIT_AREA,
    {
      title: "Edit area",
      description:
        "Edit an existing geographic area in the database. Only provided fields will be updated. Returns the updated area details in structured markdown format.",
      annotations: { title: "Edit area" },
      inputSchema: effectToZodStruct(EditAreaInputSchema),
    },
    (input) =>
      pipe(
        editAreaToolTask({
          ...input,
          label: input.label ?? undefined,
          body: input.body ?? undefined,
          draft: input.draft ?? undefined,
          featuredImage: input.featuredImage ?? undefined,
          updateGeometry: input.updateGeometry ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );
};
