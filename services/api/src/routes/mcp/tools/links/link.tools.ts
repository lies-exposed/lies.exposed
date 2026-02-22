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
        "Search for links by URL or title. Supports sorting by creation date, title, or URL.",
      annotations: { title: "Find links" },
      inputSchema: effectToZodStruct(FindLinksInputSchema),
    },
    (input) =>
      pipe(
        findLinksToolTask({
          query: input.query,
          ids: input.ids ?? [],
          status: input.status ?? undefined,
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
      description: "Retrieve a link by ID.",
      annotations: { title: "Get link" },
      inputSchema: effectToZodStruct(GetLinkInputSchema),
    },
    flow(getLinkToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_LINK,
    {
      title: "Create link",
      description:
        "Create a new link from URL. Required: url (HTTP/HTTPS). Optional config fields: title, description, publishDate, provider, image.",
      annotations: { title: "Create link" },
      inputSchema: effectToZodStruct(CreateLinkInputSchema),
    },
    (input) =>
      pipe(
        createLinkToolTask({
          ...input,
          description: input.description ?? undefined,
          publishDate: input.publishDate ?? undefined,
          status: input.status ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    EDIT_LINK,
    {
      title: "Edit link",
      description:
        "Update a link. Only provide fields to change; omitted fields keep current values.",
      annotations: { title: "Edit link" },
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
          status: input.status ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );
};
