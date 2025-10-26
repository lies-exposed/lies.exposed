import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import {
  fetchLinks,
  getListQueryEmpty,
} from "@liexp/backend/lib/queries/links/fetchLinks.query.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID as UUIDType } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { Link } from "@liexp/shared/lib/io/http/Link.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../context/context.type.js";
import { formatLinkToMarkdown } from "./formatters/linkToMarkdown.formatter.js";

export const registerLinkTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    "findLinks",
    {
      title: "Find link",
      description:
        "Search for links using various criteria like title or keywords. Returns the link item in JSON format",
      annotations: { tool: true },
      inputSchema: effectToZodStruct(
        Schema.Struct({
          query: Schema.UndefinedOr(Schema.String),
          ids: Schema.UndefinedOr(Schema.Array(Schema.UUID)),
          sort: Schema.Union(
            Schema.Literal("createdAt"),
            Schema.Literal("title"),
            Schema.Literal("url"),
            Schema.Undefined,
          ),
          order: Schema.Union(
            Schema.Literal("ASC"),
            Schema.Literal("DESC"),
            Schema.Undefined,
          ),
        }),
      ),
    },
    async ({ query, sort, order, ids }) => {
      return pipe(
        fetchLinks(
          {
            ...getListQueryEmpty,
            q: O.fromNullable(query),
            ids: pipe(
              ids as UUID[] | undefined,
              O.fromNullable,
              O.filter((a) => a.length > 0),
            ),
            _sort: O.fromNullable(sort),
            _order: O.fromNullable(order),
          },
          false,
        )(ctx),
        LoggerService.TE.debug(ctx, `Results %O`),
        fp.TE.map(([links]) => {
          if (links.length > 0) {
            const link = Schema.decodeUnknownSync(Link)(links[0]);
            return {
              content: [
                {
                  text: formatLinkToMarkdown(link),
                  type: "text" as const,
                },
              ],
            };
          }
          return {
            content: [
              {
                text: "No links found matching the search criteria.",
                type: "text" as const,
              },
            ],
          };
        }),
        throwTE,
      );
    },
  );

  const createInputSchema = effectToZodStruct(
    Schema.Struct({
      url: Schema.String.annotations({
        description: "URL of the link to create",
      }),
      title: Schema.String.annotations({
        description: "Title of the link",
      }),
      publishDate: Schema.NullOr(Schema.String).annotations({
        description: "Publish date in ISO format (YYYY-MM-DD) or null",
      }),
      description: Schema.NullOr(Schema.String).annotations({
        description: "Description of the link or null",
      }),
      events: Schema.Array(UUIDType).annotations({
        description: "Array of event UUIDs to associate with the link",
      }),
      creatorId: UUIDType.annotations({
        description: "UUID of the user creating the link",
      }),
    }),
  );

  server.registerTool(
    "createLink",
    {
      title: "Create link",
      description:
        "Create a new link in the database with the provided URL and metadata. Returns the created link details in structured markdown format.",
      annotations: { title: "Create link", tool: true },
      inputSchema: createInputSchema,
    },
    async ({ url, title, publishDate, description, events, creatorId }) => {
      return pipe(
        // Create new link directly
        ctx.db.save(LinkEntity, [
          {
            url,
            title,
            publishDate: publishDate ? new Date(publishDate) : undefined,
            description: description ?? "",
            keywords: [],
            events: events.map((id) => ({ id })),
            creator: { id: creatorId },
          },
        ]),
        TE.map(([data]) => data),
        TE.chainEitherK((link) => LinkIO.decodeSingle(link)),
        LoggerService.TE.debug(ctx, "Created link %O"),
        fp.TE.map((link) => ({
          content: [
            {
              text: formatLinkToMarkdown(link as any),
              type: "text" as const,
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
