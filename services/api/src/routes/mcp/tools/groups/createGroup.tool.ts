import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import type { AddGroupBody } from "@liexp/io/lib/http/Group.js";
import {
  toParagraph,
  toInitialValue,
} from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { createGroupFromBody } from "../../../../flows/groups/createGroup.flow.js";
import { formatGroupToMarkdown } from "../formatters/groupToMarkdown.formatter.js";

/**
 * Simplified group creation schema.
 * Only 3 required fields: name, username, kind.
 * Optional fields grouped into config object for clarity.
 */
export const CreateInputSchema = Schema.Struct({
  name: Schema.String.annotations({
    description: "Name of the group (required)",
  }),
  username: Schema.String.annotations({
    description: "Unique username for the group (required)",
  }),
  kind: Schema.Union(
    Schema.Literal("Public"),
    Schema.Literal("Private"),
  ).annotations({
    description: "Whether the group is Public or Private (required)",
  }),
  config: Schema.optional(
    Schema.Struct({
      color: Schema.optional(Schema.String).annotations({
        description: "Hex color without # (default: random)",
      }),
      excerpt: Schema.optional(Schema.String).annotations({
        description: "Short description (default: null)",
      }),
      body: Schema.optional(Schema.String).annotations({
        description: "Full body content as plain text (default: null)",
      }),
      avatar: Schema.optional(UUID).annotations({
        description: "Avatar media UUID (default: null)",
      }),
      startDate: Schema.optional(Schema.String).annotations({
        description:
          "Group start date in ISO format YYYY-MM-DD (default: null)",
      }),
      endDate: Schema.optional(Schema.String).annotations({
        description: "Group end date in ISO format YYYY-MM-DD (default: null)",
      }),
    }),
  ).annotations({
    description:
      "Optional configuration. Fields not specified use defaults (random color, null values)",
  }),
});

export type CreateInputSchema = typeof CreateInputSchema.Type;

export const createGroupToolTask = ({
  name,
  username,
  kind,
  config,
}: CreateInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  // Extract config values with sensible defaults
  const safeConfig = config ?? {};
  const getColor = (): string => {
    if (safeConfig?.color) return safeConfig.color;
    // Generate random color in hex format
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  // Helper to ensure we have a valid BlockNoteDocument
  const getExcerpt = () => {
    if (safeConfig?.excerpt) return toInitialValue(safeConfig.excerpt);
    // Return an empty paragraph as default
    return [toParagraph("")];
  };

  const groupBody: AddGroupBody = {
    name,
    username,
    kind,
    color: getColor(),
    excerpt: getExcerpt(),
    body: safeConfig?.body ? toInitialValue(safeConfig.body) : undefined,
    avatar: safeConfig?.avatar ?? undefined,
    startDate: safeConfig?.startDate
      ? new Date(safeConfig.startDate)
      : undefined,
    endDate: safeConfig?.endDate ? new Date(safeConfig.endDate) : undefined,
    members: [],
  };

  return pipe(
    createGroupFromBody(groupBody),
    fp.RTE.map((group) => {
      return {
        content: [
          {
            text: formatGroupToMarkdown(group),
            type: "text" as const,
            href: `group://${group.id}`,
          },
        ],
      };
    }),
  );
};
