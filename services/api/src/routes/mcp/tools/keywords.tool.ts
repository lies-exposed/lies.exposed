import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import {
  FIND_KEYWORDS,
  CREATE_KEYWORD,
  EDIT_KEYWORD,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchKeywords } from "@liexp/backend/lib/queries/keywords/fetchKeywords.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import type { GetKeywordListQuery } from "@liexp/io/lib/http/Keyword.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as EO from "effect/Option";
import * as O from "fp-ts/lib/Option.js";
import { defineMcpTool } from "./helpers.js";
import type { ServerContext } from "#context/context.type.js";

const keywordToOutput = (keyword: KeywordEntity) => ({
  id: keyword.id,
  tag: keyword.tag,
  color: keyword.color ?? undefined,
  socialPosts: ((keyword.socialPosts ?? []) as { id: string }[]).map(
    (s) => s.id,
  ),
  eventCount: keyword.eventCount ?? 0,
  linkCount: keyword.linkCount ?? 0,
  createdAt: keyword.createdAt.toISOString(),
  updatedAt: keyword.updatedAt.toISOString(),
});

export const registerKeywordsTools = (
  server: McpServer,
  ctx: ServerContext,
) => {
  // --- findKeywords ---
  const findKeywordsTool = defineMcpTool(
    Schema.Struct({
      q: Schema.UndefinedOr(Schema.String).annotations({
        description: "Search query for keyword tag (partial match supported)",
      }),
      ids: Schema.optional(Schema.Array(Schema.String)).annotations({
        description: "Array of keyword UUIDs to filter by",
      }),
      sort: Schema.optional(
        Schema.Union(
          Schema.Literal("tag"),
          Schema.Literal("createdAt"),
          Schema.Literal("updatedAt"),
        ),
      ).annotations({
        description:
          'Sort field: "createdAt", "updatedAt", or "tag". Defaults to createdAt',
      }),
      order: Schema.optional(
        Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
      ).annotations({
        description: 'Sort order: "ASC" for ascending or "DESC" for descending',
      }),
      start: Schema.optional(Schema.Number).annotations({
        description: "Pagination start index",
      }),
      end: Schema.optional(Schema.Number).annotations({
        description: "Pagination end index",
      }),
    }),
    async (input) => {
      const { q, ids, sort, order, start, end } = input;

      // fetchKeywords expects effect Options for every query field
      const keywordQuery: Partial<GetKeywordListQuery> = {
        ...(q ? { q: EO.some(q) } : {}),
        ...(ids && ids.length > 0
          ? {
              ids: EO.some(ids as readonly UUID[]),
            }
          : {}),
        ...(sort ? { _sort: EO.some(sort) } : {}),
        ...(order ? { _order: EO.some(order) } : {}),
        ...(start !== undefined ? { _start: EO.some(Number(start)) } : {}),
        ...(end !== undefined ? { _end: EO.some(Number(end)) } : {}),
      };

      try {
        const te = fetchKeywords(keywordQuery, true)(ctx);
        const result = await pipe(
          te,
          fp.TE.map(([results, total]) => ({
            keywords: results.map(keywordToOutput),
            total,
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find keywords",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(result.right),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("findKeywords error: %O", err);
        throw new Error(
          `Failed to find keywords: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    FIND_KEYWORDS,
    {
      title: "Find keywords",
      description:
        "Search and list keywords in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find keywords", readOnlyHint: true },
      inputSchema: findKeywordsTool.inputSchema,
    },
    findKeywordsTool.handler,
  );

  // --- createKeyword ---
  const createKeywordTool = defineMcpTool(
    Schema.Struct({
      tag: Schema.String.annotations({
        description: "Tag identifier for the keyword (required)",
      }),
      color: Schema.optional(Schema.String).annotations({
        description: "Hex color without # (default: random)",
      }),
    }),
    async (input) => {
      const { tag, color } = input;

      if (!tag) {
        throw new Error("Keyword tag is required");
      }

      try {
        const createBody: Record<string, unknown> = { tag };
        if (color !== undefined) createBody.color = color;

        const result = await pipe(
          ctx.db.findOne(KeywordEntity, { where: { tag } }),
          fp.TE.filterOrElse(O.isNone, () =>
            ServerError.of([`Keyword ${tag} already exists.`]),
          ),
          fp.TE.chain(() => ctx.db.save(KeywordEntity, [createBody])),
          fp.TE.chain(([saved]) =>
            ctx.db.findOneOrFail(KeywordEntity, {
              where: { id: saved.id },
              loadRelationIds: true,
            }),
          ),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create keyword",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(keywordToOutput(result.right)),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("createKeyword error: %O", err);
        throw new Error(
          `Failed to create keyword: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    CREATE_KEYWORD,
    {
      title: "Create keyword",
      description:
        "Create a new keyword in the database. Requires admin privileges.",
      annotations: { title: "Create keyword", destructiveHint: true },
      inputSchema: createKeywordTool.inputSchema,
    },
    createKeywordTool.handler,
  );

  // --- editKeyword ---
  const editKeywordTool = defineMcpTool(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "UUID of the keyword to edit (required)",
      }),
      tag: Schema.optional(Schema.String).annotations({
        description: "Tag identifier or undefined to keep current",
      }),
      color: Schema.optional(Schema.String).annotations({
        description: "Hex color without # or undefined to keep current",
      }),
    }),
    async (input) => {
      const { id, tag, color } = input;

      if (!id) {
        throw new Error("Keyword ID is required");
      }

      try {
        // Build update payload, removing undefined values
        const updatePayload: Record<string, unknown> = { id };
        if (tag !== undefined) updatePayload.tag = tag;
        if (color !== undefined) updatePayload.color = color;

        const result = await pipe(
          ctx.db.save(KeywordEntity, [updatePayload]),
          fp.TE.chain(() =>
            ctx.db.findOneOrFail(KeywordEntity, {
              where: { id },
              loadRelationIds: true,
            }),
          ),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to edit keyword",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify(keywordToOutput(result.right)),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("editKeyword error: %O", err);
        throw new Error(
          `Failed to edit keyword: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    EDIT_KEYWORD,
    {
      title: "Edit keyword",
      description:
        "Update an existing keyword in the database. Requires admin privileges.",
      annotations: { title: "Edit keyword", destructiveHint: true },
      inputSchema: editKeywordTool.inputSchema,
    },
    editKeywordTool.handler,
  );
};
