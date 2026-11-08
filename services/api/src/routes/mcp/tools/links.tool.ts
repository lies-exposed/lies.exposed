import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { fromURL } from "@liexp/backend/lib/flows/links/link.flow.js";
import {
  FIND_LINKS,
  CREATE_LINK,
  EDIT_LINK,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fetchLinks } from "@liexp/backend/lib/queries/links/fetchLinks.query.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { URL } from "@liexp/io/lib/http/Common/index.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import { defineMcpTool } from "./helpers.js";
import type { ServerContext } from "#context/context.type.js";

const linkToOutput = (link: LinkEntity) => ({
  id: link.id,
  url: link.url,
  title: link.title ?? undefined,
  description: link.description ?? undefined,
  status: link.status,
  publishDate: link.publishDate ?? undefined,
  image: link.image
    ? {
        id: typeof link.image === "string" ? link.image : link.image.id,
        label: typeof link.image === "string" ? undefined : link.image.label,
        thumbnail:
          typeof link.image === "string" ? undefined : link.image.thumbnail,
        type: typeof link.image === "string" ? undefined : link.image.type,
      }
    : undefined,
  keywords: (link.keywords as { id: string }[]).map((k) => k.id),
  events: (link.events as { id: string }[]).map((e) => e.id),
  createdAt: link.createdAt,
  updatedAt: link.updatedAt,
});

export const registerLinksTools = (server: McpServer, ctx: ServerContext) => {
  // --- findLinks ---
  const findLinksTool = defineMcpTool(
    Schema.Struct({
      query: Schema.UndefinedOr(Schema.String).annotations({
        description: "Search query string to filter links by title or URL",
      }),
      sort: Schema.UndefinedOr(
        Schema.Union(
          Schema.Literal("createdAt"),
          Schema.Literal("title"),
          Schema.Literal("url"),
        ),
      ).annotations({
        description: 'Sort field: "createdAt", "title", or "url"',
      }),
      order: Schema.UndefinedOr(
        Schema.Union(Schema.Literal("ASC"), Schema.Literal("DESC")),
      ).annotations({
        description: 'Sort order: "ASC" or "DESC"',
      }),
      start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Pagination offset (default: 0)",
      }),
      end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Pagination limit (default: 20)",
      }),
    }),
    async (input) => {
      const { query, sort, order, start, end } = input;

      const linkQuery: Record<string, unknown> = {};
      if (query) {
        linkQuery.q = query;
      }
      if (sort) {
        linkQuery.sort = sort;
      }
      if (order) {
        linkQuery.order = order;
      }
      if (start !== undefined) {
        linkQuery.start = Number(start);
      }
      if (end !== undefined) {
        linkQuery.end = Number(end);
      }

      try {
        const te = fetchLinks(linkQuery, true)(ctx);
        const result = await pipe(
          te,
          fp.TE.map(([links, total]) => ({
            links: links.map(linkToOutput),
            total,
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find links",
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
        ctx.logger.error.log("findLinks error: %O", err);
        throw new Error(
          `Failed to find links: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    FIND_LINKS,
    {
      title: "Find links",
      description:
        "Search and list links in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find links", readOnlyHint: true },
      inputSchema: findLinksTool.inputSchema,
    },
    findLinksTool.handler,
  );

  // --- createLink ---
  const createLinkTool = defineMcpTool(
    Schema.Struct({
      url: Schema.String.annotations({
        description: "URL of the link (required)",
      }),
    }),
    async (input) => {
      const { url } = input;

      try {
        // Check for existing link with same URL
        const existingEither = await ctx.db.findOne(LinkEntity, {
          where: { url },
        })();

        if (fp.E.isRight(existingEither) && fp.O.isSome(existingEither.right)) {
          return {
            content: [
              {
                text: JSON.stringify({
                  link: linkToOutput(existingEither.right.value),
                  created: false,
                }),
                type: "text" as const,
              },
            ],
          };
        }

        // Create new link from URL
        const user = new UserEntity();
        user.id = uuid();
        const brandedURL = Schema.decodeUnknownSync(URL)(url);
        const result = await pipe(
          fromURL(user, brandedURL, {
            description: undefined,
            type: "image/jpeg" as const,
          })(ctx),
          fp.TE.map((link) => ({
            link: linkToOutput(link),
            created: true,
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create link",
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
        ctx.logger.error.log("createLink error: %O", err);
        throw new Error(
          `Failed to create link: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    CREATE_LINK,
    {
      title: "Create link",
      description:
        "Create a new link with URL deduplication and metadata enrichment. If a link with the same URL exists, returns it. Otherwise fetches metadata from the URL and creates a new link.",
      annotations: { title: "Create link", destructiveHint: true },
      inputSchema: createLinkTool.inputSchema,
    },
    createLinkTool.handler,
  );

  // --- editLink ---
  const editLinkTool = defineMcpTool(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "ID of the link to edit (required)",
      }),
      title: Schema.UndefinedOr(Schema.String).annotations({
        description: "New title",
      }),
      description: Schema.UndefinedOr(Schema.String).annotations({
        description: "New description",
      }),
      url: Schema.UndefinedOr(Schema.String).annotations({
        description: "New URL",
      }),
      status: Schema.UndefinedOr(Schema.String).annotations({
        description: "New status",
      }),
      publishDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "New publish date (ISO 8601 string)",
      }),
      events: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New events (array of event IDs)",
      }),
      keywords: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "New keywords (array of keyword IDs)",
      }),
    }),
    async (input) => {
      const {
        id,
        title,
        description,
        url,
        status,
        publishDate,
        events,
        keywords,
      } = input;

      try {
        // Find the existing link
        const foundEither = await ctx.db.findOneOrFail(LinkEntity, {
          where: { id },
          relations: { image: true },
        })();

        if (fp.E.isLeft(foundEither)) {
          throw new Error(`Link not found: ${id}`);
        }

        const link = foundEither.right;

        // Build updates object with only provided fields
        const updates: Record<string, unknown> = {};
        if (title !== undefined) updates.title = title;
        if (description !== undefined) updates.description = description;
        if (url !== undefined) updates.url = url;
        if (status !== undefined) updates.status = status;
        if (publishDate !== undefined) {
          const pd = new Date(publishDate);
          updates.publishDate = isNaN(pd.getTime()) ? publishDate : pd;
        }
        if (events !== undefined) {
          updates.events = events.map((eId: string) => ({ id: eId }));
        }
        if (keywords !== undefined) {
          updates.keywords = keywords.map((kId: string) => ({ id: kId }));
        }

        // Save the updated link
        const savedEither = await ctx.db.save(LinkEntity, [
          { ...link, ...updates },
        ])();

        if (fp.E.isLeft(savedEither)) {
          throw new Error("Failed to update link");
        }

        // Reload the link with relations
        const updatedEither = await ctx.db.findOneOrFail(LinkEntity, {
          where: { id },
          relations: { image: true, events: true, keywords: true },
        })();

        if (fp.E.isLeft(updatedEither)) {
          throw new Error("Failed to reload link");
        }

        return {
          content: [
            {
              text: JSON.stringify({ link: linkToOutput(updatedEither.right) }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("editLink error: %O", err);
        return {
          content: [
            {
              text: JSON.stringify({
                error: err instanceof Error ? err.message : String(err),
              }),
              type: "text" as const,
            },
          ],
        };
      }
    },
  );

  server.registerTool(
    EDIT_LINK,
    {
      title: "Edit link",
      description:
        "Update a link's title, description, url, status, publishDate, events, or keywords. Only provided fields are updated.",
      annotations: { title: "Edit link", destructiveHint: true },
      inputSchema: editLinkTool.inputSchema,
    },
    editLinkTool.handler,
  );
};
