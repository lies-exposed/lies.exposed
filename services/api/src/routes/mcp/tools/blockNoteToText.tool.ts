import { BLOCK_NOTE_TO_TEXT } from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { BlockNoteDocument } from "@liexp/shared/lib/io/http/Common/BlockNoteDocument.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";

export const registerBlockNoteTools = (server: McpServer) => {
  const inputSchema = effectToZodStruct(
    Schema.Struct({
      blocknote: BlockNoteDocument.annotations({
        description:
          "BlockNote JSON document to convert to plain text (usually from 'excerpt', 'body', or 'body2' fields)",
      }),
    }),
  );

  server.registerTool(
    BLOCK_NOTE_TO_TEXT,
    {
      title: "Convert BlockNote to text",
      description:
        "Convert BlockNote JSON blocks into plain text format. Usually the 'excerpt', 'body' and 'body2' fields of entities retrieved by the API MCP server",
      annotations: { tool: true },
      inputSchema: inputSchema,
    },
    (opts) => {
      const { blocknote } = opts ?? {};
      if (!isValidValue(blocknote)) {
        throw new Error("Invalid BlockNote document");
      }
      return Promise.resolve({
        content: [
          {
            text: getTextContents(blocknote),
            type: "text" as const,
          },
        ],
      });
    },
  );
};
