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
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
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
  const findLinksInputSchema = effectToZodStruct(
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
  );

  server.registerTool(
    FIND_LINKS,
    {
      title: "Find links",
      description:
        "Search and list links in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find links" },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: findLinksInputSchema as unknown as {
        query?: any;
        sort?: any;
        order?: any;
        start?: any;
        end?: any;
      },
    },
    async (opts) => {
      const { query, sort, order, start, end } = opts ?? {};

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
        // fetchLinks returns ReaderTaskEither, call with ctx to get TaskEither
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

  // --- createLink ---
  const createLinkInputSchema = effectToZodStruct(
    Schema.Struct({
      url: Schema.String.annotations({
        description: "URL of the link (required)",
      }),
    }),
  );

  server.registerTool(
    CREATE_LINK,
    {
      title: "Create link",
      description:
        "Create a new link with URL deduplication and metadata enrichment. If a link with the same URL exists, returns it. Otherwise fetches metadata from the URL and creates a new link.",
      annotations: { title: "Create link" },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: createLinkInputSchema as unknown as { url?: any },
    },
    async (opts) => {
      const { url } = opts ?? {};
      if (!url) {
        throw new Error("URL is required");
      }

      try {
        // Check for existing link with same URL
        // ctx.db.findOne returns TaskEither<DBError, O.Option<LinkEntity>>
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

        // No existing link, create new one with metadata enrichment
        const user = new UserEntity();
        user.id = uuid();

        // Validate and convert URL string to branded URL type
        const brandedURL = Schema.decodeUnknownSync(URL)(url);

        // fromURL returns ReaderTaskEither, call with ctx to get TaskEither
        const fromURTE = fromURL(user, brandedURL, {
          description: undefined,
          type: "image/jpeg" as const,
        })(ctx);
        const enrichedEither = await fromURTE();

        if (fp.E.isLeft(enrichedEither)) {
          throw new Error(
            (enrichedEither.left as Error).message ??
              "Failed to fetch URL metadata",
          );
        }

        const linkEntity = enrichedEither.right as LinkEntity & { image: null };
        const savedEither = await ctx.db.save(LinkEntity, [
          {
            ...linkEntity,
            events: [],
            title: linkEntity.title,
            url: linkEntity.url,
            keywords: [],
            creator: { id: user.id } as Parameters<
              typeof ctx.db.save
            >[1][0]["creator"],
          },
        ])();

        if (fp.E.isLeft(savedEither)) {
          throw new Error(
            (savedEither.left as Error).message ?? "Failed to save link",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify({
                link: linkToOutput(savedEither.right[0]),
                created: true,
              }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("createLink error: %O", err);
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

  // --- editLink ---
  const editLinkInputSchema = effectToZodStruct(
    Schema.Struct({
      id: Schema.String.annotations({
        description: "UUID of the link to edit (required)",
      }),
      title: Schema.UndefinedOr(Schema.String).annotations({
        description: "Link title",
      }),
      description: Schema.UndefinedOr(Schema.String).annotations({
        description: "Link description",
      }),
      url: Schema.UndefinedOr(Schema.String).annotations({
        description: "Link URL",
      }),
      status: Schema.UndefinedOr(
        Schema.Union(
          Schema.Literal("DRAFT"),
          Schema.Literal("APPROVED"),
          Schema.Literal("UNAPPROVED"),
        ),
      ).annotations({
        description: 'Link status: "DRAFT" | "APPROVED" | "UNAPPROVED"',
      }),
      publishDate: Schema.UndefinedOr(Schema.String).annotations({
        description: "Publication date YYYY-MM-DD",
      }),
      events: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Event UUIDs to associate",
      }),
      keywords: Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({
        description: "Keyword UUIDs to associate",
      }),
    }),
  );

  server.registerTool(
    EDIT_LINK,
    {
      title: "Edit link",
      description:
        "Update a link's title, description, url, status, publishDate, events, or keywords. Only provided fields are updated.",
      annotations: { title: "Edit link" },
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
      inputSchema: editLinkInputSchema as unknown as {
        id?: any;
        title?: any;
        description?: any;
        url?: any;
        status?: any;
        publishDate?: any;
        events?: any;
        keywords?: any;
      },
    },
    async (opts) => {
      const {
        id,
        title,
        description,
        url,
        status,
        publishDate,
        events,
        keywords,
      } = opts ?? {};
      if (!id) {
        throw new Error("Link ID is required");
      }

      try {
        // Find the existing link
        // ctx.db.findOneOrFail returns TaskEither<DBError, LinkEntity>
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
          updates.events = (events as string[]).map((eId) => ({ id: eId }));
        }
        if (keywords !== undefined) {
          updates.keywords = (keywords as string[]).map((kId) => ({ id: kId }));
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
};
