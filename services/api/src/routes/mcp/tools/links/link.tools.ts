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
        "Search for links by URL, title, or keywords. CRITICAL: Always search before creating links to avoid duplicates.\n\nSEARCH CRITERIA:\n- query: Search in title or URL (e.g., 'news example.com', 'covid vaccination')\n- sort: by createdAt (default), title, or url\n- order: ASC (ascending) or DESC (descending)\n\nEXAMPLES:\n1. Find by topic: query='covid vaccination'\n2. Find by domain: query='example.com'\n3. Find and sort by title: query='health', sort='title', order='ASC'\n\nReturns matching links with full details (URL, title, description, metadata).",
      annotations: { title: "Find links" },
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
        "Create a new link in the database for storing web references for fact-checking.\\n\\nREQUIRED FIELDS:\\n- url: HTTP/HTTPS URL (must be valid URL format)\\n\\nOPTIONAL IN CONFIG:\\n- title: Override fetched page title\\n- description: Summary of link content\\n- publishDate: When article was published (ISO format: YYYY-MM-DD)\\n- provider: Source domain or platform name\\n- image: Featured image URL\\n\\nEXAMPLES:\\n1. MINIMAL: { url: 'https://news.example.com/article' }\\n   → Auto-fetches title and metadata\\n\\n2. FULL: { url: 'https://...', title: 'Custom Title', description: 'Summary', publishDate: '2026-02-14', provider: 'Example News', image: 'https://...' }\\n   → Creates link with all metadata specified\\n\\nTIPS:\\n- Always FIND_LINKS first to avoid duplicate references\\n- Valid URLs must start with http:// or https://\\n- System auto-fetches title/description if not provided\\n- Use to store references for actor/group/event creation",
      annotations: { title: "Create link" },
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
        "Edit an existing link in the database. Only provided fields will be updated. Returns the updated link details in structured markdown format.\\n\\nDESCRIPTION BEHAVIOR:\\n- Omitted fields: Keep existing value\\n- null: Clear/remove the value\\n- Empty array: Clear array\\n\\nUPDATABLE FIELDS:\\n- url: New URL\\n- title: New title\\n- description: New description\\n- publishDate: Update publish date (YYYY-MM-DD)\\n- provider: Update source domain\\n- image: Update featured image URL",
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
        }),
        throwRTE(ctx),
      ),
  );
};
