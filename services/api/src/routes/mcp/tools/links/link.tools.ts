import {
  CREATE_LINK,
  EDIT_LINK,
  FIND_LINKS,
  GET_LINK,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import {
  CreateLinkInputSchema,
  createLinkToolTask,
} from "./createLink.tool.js";
import { EditLinkInputSchema, editLinkToolTask } from "./editLink.tool.js";
import { FindLinksInputSchema, findLinksToolTask } from "./findLinks.tool.js";
import { GetLinkInputSchema, getLinkToolTask } from "./getLink.tool.js";

export const registerLinkTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_LINKS,
    {
      title: "Find links",
      description:
        "Search for links using various criteria like title or keywords. Returns the link item in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(FindLinksInputSchema),
    },
    (input) =>
      pipe(
        findLinksToolTask({
          query: input.query,
          ids: input.ids ?? [],
          sort: input.sort,
          order: input.order,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    GET_LINK,
    {
      title: "Get link",
      description:
        "Retrieve a link by its ID. Returns the link item in JSON format.",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(GetLinkInputSchema),
    },
    flow(getLinkToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_LINK,
    {
      title: "Create link",
      description:
        "Create a new link in the database with the provided URL and metadata. Returns the created link details in structured markdown format.",
      annotations: { title: "Create link", tool: true },
      inputSchema: effectToZodStruct(CreateLinkInputSchema),
    },
    (input) =>
      pipe(
        createLinkToolTask({
          ...input,
          description: input.description ?? undefined,
          publishDate: input.publishDate ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    EDIT_LINK,
    {
      title: "Edit link",
      description:
        "Edit an existing link in the database. Only provided fields will be updated. Returns the updated link details in structured markdown format.",
      annotations: { title: "Edit link", tool: true },
      inputSchema: effectToZodStruct(EditLinkInputSchema),
    },
    (input) =>
      pipe(
        editLinkToolTask({
          ...input,
          url: input.url ?? undefined,
          title: input.title ?? undefined,
          description: input.description ?? undefined,
          publishDate: input.publishDate ?? undefined,
          provider: input.provider ?? undefined,
          image: input.image ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );
};
