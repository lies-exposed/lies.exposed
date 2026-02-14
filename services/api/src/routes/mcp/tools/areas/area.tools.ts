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
      title: "Find areas",
      description:
        "Search for geographic areas by name or description. CRITICAL: Always search before creating areas to avoid duplicates.\n\nSEARCH CRITERIA:\n- query: Search in area name or description (e.g., 'Europe', 'United States', 'North America')\n- withDeleted: Include deleted areas in results (optional)\n- sort: by createdAt (default) or label\n- order: ASC (ascending) or DESC (descending)\n- start/end: Pagination start and end indices\n\nEXAMPLES:\n1. Find continent: query='Europe'\n2. Find country: query='Italy'\n3. Find with pagination: query='*', start=0, end=20\n\nReturns matching geographic areas with full details (coordinates, geometry, metadata).",
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
        "Create a new geographic area (country, region, continent) in the database with location data.\\n\\nREQUIRED FIELDS:\\n- label: Area name (e.g., 'Italy', 'Europe', 'North America')\\n\\nOPTIONAL IN CONFIG:\\n- body: Detailed description of the area\\n- draft: Mark as draft (true/false)\\n- featuredImage: Image URL for the area\\n- updateGeometry: Geographic boundaries (GeoJSON format)\\n\\nEXAMPLES:\\n1. MINIMAL: { label: 'Italy' }\\n   → Creates area with name only\\n\\n2. DETAILED: { label: 'Europe', body: 'European continent...', updateGeometry: {...GeoJSON...} }\\n   → Creates area with description and geographic boundaries\\n\\nTIPS:\\n- Always FIND_AREAS first to avoid duplicates\\n- Use consistent naming (e.g., 'United States' not 'USA')\\n- Geometry should be valid GeoJSON if provided\\n- Used for mapping events to geographic locations",
      annotations: { title: "Create area" },
      inputSchema: effectToZodStruct(CreateAreaInputSchema),
    },
    flow(createAreaToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    EDIT_AREA,
    {
      title: "Edit area",
      description: `Update an existing geographic area in the database. Only provide fields you want to 
change; omitted fields keep their existing values.

REQUIRED:
- id: The unique identifier of the area to update

OPTIONAL (provide only fields to change):
- label: Area name (e.g., 'Italy', 'Europe')
- body: Detailed description of the area
- draft: Mark as draft (true/false)
- featuredImage: Image URL for the area
- updateGeometry: Geographic boundaries (GeoJSON format)

UPDATE BEHAVIOR:
- Omitted fields: Keep their current values
- Provided fields: Update with new values

TIPS:
- Use findAreas() to search for the area if unsure of ID
- Only include fields you want to change
- Geometry should be valid GeoJSON if provided
- Returns the updated area with full details`,
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
