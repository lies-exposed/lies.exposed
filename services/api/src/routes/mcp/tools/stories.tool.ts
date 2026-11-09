import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import {
  FIND_STORIES,
  CREATE_STORY,
  EDIT_STORY,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Schema } from "effect";
import { Like } from "typeorm";
import { defineMcpTool } from "./helpers.js";
import type { ServerContext } from "#context/context.type.js";

const storyToOutput = (story: StoryEntity) => ({
  id: story.id,
  title: story.title,
  path: story.path,
  draft: story.draft,
  date: story.date?.toISOString() ?? new Date().toISOString(),
  featuredImage:
    story.featuredImage && typeof story.featuredImage === "object"
      ? story.featuredImage.id
      : (story.featuredImage ?? undefined),
  excerpt: story.excerpt ?? undefined,
  body: story.body ?? undefined,
  creator: story.creator
    ? typeof story.creator === "object"
      ? story.creator.id
      : story.creator
    : undefined,
  keywords: ((story.keywords ?? []) as { id: string }[]).map(
    (k: { id: string }) => k.id,
  ),
  actors: ((story.actors ?? []) as { id: string }[]).map(
    (a: { id: string }) => a.id,
  ),
  groups: ((story.groups ?? []) as { id: string }[]).map(
    (g: { id: string }) => g.id,
  ),
  events: ((story.events ?? []) as { id: string }[]).map(
    (e: { id: string }) => e.id,
  ),
  media: ((story.media ?? []) as { id: string }[]).map(
    (m: { id: string }) => m.id,
  ),
  links: ((story.links ?? []) as { id: string }[]).map(
    (l: { id: string }) => l.id,
  ),
  createdAt: story.createdAt.toISOString(),
  updatedAt: story.updatedAt.toISOString(),
  deletedAt: story.deletedAt?.toISOString() ?? undefined,
});

export const registerStoriesTools = (server: McpServer, ctx: ServerContext) => {
  // --- findStories ---
  const findStoriesTool = defineMcpTool(
    Schema.Struct({
      query: Schema.UndefinedOr(Schema.String).annotations({
        description:
          "Full-text search query to filter stories by title or body",
      }),
      draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
        description: "Filter by draft status",
      }),
      creator: Schema.UndefinedOr(UUID).annotations({
        description: "Filter by creator UUID",
      }),
      start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Pagination offset (default: 0)",
      }),
      end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
        description: "Pagination limit (default: 20)",
      }),
    }),
    async (input) => {
      const { query, draft, creator, start, end } = input;

      const skip = Number(start ?? 0);
      const take = Number(end ?? 20);

      // Build query options for ctx.db.find
      const where: Record<string, unknown> = {};
      if (query) {
        // TypeORM ILIKE for full-text search on title
        where.title = Like(`%${query}%`);
      }
      if (draft !== undefined) {
        where.draft = draft === "true" || draft === true;
      }
      if (creator) {
        where.creator = creator;
      }

      const findOptions = {
        where,
        skip,
        take,
        order: { createdAt: "DESC" as const },
        relations: {
          featuredImage: true,
          creator: true,
          keywords: true,
          actors: true,
          groups: true,
          events: true,
          media: true,
          links: true,
        },
      };

      try {
        // Invoke the TaskEithers first, then run in parallel
        const [resultsTE, countTE] = await Promise.all([
          ctx.db.find(StoryEntity, findOptions)(),
          ctx.db.count(StoryEntity, { where })(),
        ]);

        // Check for errors first
        if (fp.E.isLeft(resultsTE)) {
          throw new Error(
            (resultsTE.left as Error).message ?? "Failed to find stories",
          );
        }
        if (fp.E.isLeft(countTE)) {
          throw new Error(
            (countTE.left as Error).message ?? "Failed to count stories",
          );
        }

        return {
          content: [
            {
              text: JSON.stringify({
                stories: resultsTE.right.map(storyToOutput),
                total: countTE.right,
              }),
              type: "text" as const,
            },
          ],
        };
      } catch (err) {
        ctx.logger.error.log("findStories error: %O", err);
        throw new Error(
          `Failed to find stories: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    FIND_STORIES,
    {
      title: "Find stories",
      description:
        "Search and list stories in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find stories", readOnlyHint: true },
      inputSchema: findStoriesTool.inputSchema,
    },
    findStoriesTool.handler,
  );

  // --- createStory ---
  const createStoryTool = defineMcpTool(
    Schema.Struct({
      title: Schema.String.annotations({
        description: "Story title (required)",
      }),
      path: Schema.String.annotations({
        description: "URL-friendly path slug (required)",
      }),
      date: Schema.String.annotations({
        description: "Publication date YYYY-MM-DD (required)",
      }),
      draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
        description: "Draft status (default: true)",
      }),
      creator: Schema.UndefinedOr(UUID).annotations({
        description: "Creator actor UUID",
      }),
      featuredImage: Schema.UndefinedOr(UUID).annotations({
        description: "Featured image media UUID",
      }),
      keywords: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Keyword UUIDs to associate",
      }),
      actors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Actor UUIDs to associate",
      }),
      groups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Group UUIDs to associate",
      }),
      events: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Event UUIDs to associate",
      }),
      media: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Media UUIDs to associate",
      }),
    }),
    async (input) => {
      const {
        title,
        path,
        date,
        draft,
        creator,
        featuredImage,
        keywords,
        actors,
        groups,
        events,
        media,
      } = input;

      try {
        const draftValue =
          draft !== undefined ? draft === "true" || draft === true : true;
        const featuredImageValue = featuredImage ? { id: featuredImage } : null;

        // Build the story object following createStory.controller.ts logic
        const storyData: Record<string, unknown> = {
          title,
          path,
          date: new Date(date),
          draft: draftValue,
          featuredImage: featuredImageValue,
          creator: creator ? { id: creator } : null,
          keywords: (keywords ?? []).map((k: string) => ({ id: k })),
          actors: (actors ?? []).map((a: string) => ({ id: a })),
          groups: (groups ?? []).map((g: string) => ({ id: g })),
          events: (events ?? []).map((e: string) => ({ id: e })),
          media: (media ?? []).map((m: string) => ({ id: m })),
          links: [],
          body: null,
        };

        // Save the story
        const saveTE = ctx.db.save(StoryEntity, [storyData]);

        // Fetch the created story with relations
        const fetchTE = pipe(
          saveTE,
          fp.TE.chain(([createdStory]) =>
            ctx.db.findOneOrFail(StoryEntity, {
              where: { id: createdStory.id },
              relations: {
                featuredImage: true,
                creator: true,
                keywords: true,
                actors: true,
                groups: true,
                events: true,
                media: true,
                links: true,
              },
              loadRelationIds: {
                relations: [
                  "keywords",
                  "actors",
                  "groups",
                  "events",
                  "media",
                  "links",
                ],
              },
            }),
          ),
        );

        const result = await pipe(
          fetchTE,
          fp.TE.map((s: StoryEntity) => storyToOutput(s)),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create story",
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
        ctx.logger.error.log("createStory error: %O", err);
        throw new Error(
          `Failed to create story: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    CREATE_STORY,
    {
      title: "Create story",
      description:
        "Create a new story in the database with title, path, date, and optional associations.",
      annotations: { title: "Create story", destructiveHint: true },
      inputSchema: createStoryTool.inputSchema,
    },
    createStoryTool.handler,
  );

  // --- editStory ---
  const editStoryTool = defineMcpTool(
    Schema.Struct({
      id: UUID.annotations({
        description: "UUID of the story to edit (required)",
      }),
      title: Schema.UndefinedOr(Schema.String).annotations({
        description: "Story title",
      }),
      path: Schema.UndefinedOr(Schema.String).annotations({
        description: "URL-friendly path slug",
      }),
      date: Schema.UndefinedOr(Schema.String).annotations({
        description: "Publication date YYYY-MM-DD",
      }),
      draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
        description: "Draft status",
      }),
      creator: Schema.UndefinedOr(UUID).annotations({
        description: "Creator actor UUID",
      }),
      featuredImage: Schema.UndefinedOr(UUID).annotations({
        description: "Featured image media UUID (null to remove)",
      }),
      body: Schema.UndefinedOr(Schema.Any).annotations({
        description: "Body of the story as BlockNote document",
      }),
      keywords: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Keyword UUIDs to associate",
      }),
      links: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Link UUIDs to associate",
      }),
      actors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Actor UUIDs to associate",
      }),
      groups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Group UUIDs to associate",
      }),
      events: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Event UUIDs to associate",
      }),
      media: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
        description: "Media UUIDs to associate",
      }),
    }),
    async (input) => {
      const {
        id,
        title,
        path,
        date,
        draft,
        creator,
        featuredImage,
        body,
        keywords,
        links,
        actors,
        groups,
        events,
        media,
      } = input;

      if (!id) {
        throw new Error("Story ID is required");
      }

      try {
        // Fetch the existing story
        const fetchTE = ctx.db.findOneOrFail(StoryEntity, {
          where: { id },
          relations: {
            featuredImage: true,
            creator: true,
            keywords: true,
            actors: true,
            groups: true,
            events: true,
            media: true,
            links: true,
          },
          loadRelationIds: {
            relations: [
              "creator",
              "actors",
              "groups",
              "keywords",
              "links",
              "media",
              "events",
            ],
          },
          withDeleted: true,
        });

        // Update the story
        const updateTE = pipe(
          fetchTE,
          fp.TE.chain((existing: StoryEntity) => {
            // Build the update object
            const updateData: Record<string, unknown> = {
              ...existing,
              title: title ?? existing.title,
              path: path ?? existing.path,
              date: date ? new Date(date) : existing.date,
              draft:
                draft !== undefined
                  ? draft === "true" || draft === true
                  : existing.draft,
              body: body ?? existing.body,
              creator:
                creator !== undefined
                  ? creator
                    ? { id: creator }
                    : null
                  : existing.creator,
              keywords:
                keywords !== undefined
                  ? keywords.map((k: string) => ({ id: k }))
                  : existing.keywords,
              links:
                links !== undefined
                  ? links.map((l: string) => ({ id: l }))
                  : existing.links,
              actors:
                actors !== undefined
                  ? actors.map((a: string) => ({ id: a }))
                  : existing.actors,
              groups:
                groups !== undefined
                  ? groups.map((g: string) => ({ id: g }))
                  : existing.groups,
              events:
                events !== undefined
                  ? events.map((e: string) => ({ id: e }))
                  : existing.events,
              media:
                media !== undefined
                  ? media.map((m: string) => ({ id: m }))
                  : existing.media,
              featuredImage:
                featuredImage !== undefined
                  ? featuredImage === null
                    ? null
                    : { id: featuredImage }
                  : existing.featuredImage,
            };

            return ctx.db.save(StoryEntity, [updateData]);
          }),
        );

        // Fetch the updated story
        const result = await pipe(
          updateTE,
          fp.TE.chain(() =>
            ctx.db.findOneOrFail(StoryEntity, {
              where: { id },
              relations: {
                featuredImage: true,
                creator: true,
                keywords: true,
                actors: true,
                groups: true,
                events: true,
                media: true,
                links: true,
              },
              loadRelationIds: {
                relations: [
                  "creator",
                  "actors",
                  "groups",
                  "keywords",
                  "links",
                  "media",
                  "events",
                ],
              },
              withDeleted: true,
            }),
          ),
          fp.TE.map((s: StoryEntity) => storyToOutput(s)),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error("Failed to edit story");
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
        ctx.logger.error.log("editStory error: %O", err);
        throw new Error(
          `Failed to edit story: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    EDIT_STORY,
    {
      title: "Edit story",
      description:
        "Update an existing story in the database. Provide the story ID and any fields to update.",
      annotations: { title: "Edit story", destructiveHint: true },
      inputSchema: editStoryTool.inputSchema,
    },
    editStoryTool.handler,
  );
};
