import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { SocialPostEntity } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { fetchSocialPostRelations } from "@liexp/backend/lib/flows/social-post/fetchSocialPostRelations.flow.js";
import {
  type SocialPostEntityWithContent,
  SocialPostIO,
} from "@liexp/backend/lib/io/socialPost.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type SocialPost, TO_PUBLISH } from "@liexp/io/lib/http/SocialPost.js";
import { takeSocialPostRelations } from "@liexp/shared/lib/helpers/social-post.js";
import {
  CreateSocialPostInputSchema,
  EditSocialPostInputSchema,
  FindSocialPostsInputSchema,
} from "@liexp/shared/lib/mcp/schemas/socialposts.schemas.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { addHours } from "date-fns";
import { Schema } from "effect";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal, In } from "typeorm";
import { type ServerContext } from "../../../context/context.type.js";
import { toControllerError } from "../../../io/ControllerError.js";
import { defineMcpTool } from "./helpers.js";

// --- Tool constants ---
const FIND_SOCIAL_POSTS = "findSocialPosts";
const CREATE_SOCIAL_POST = "createSocialPost";
const EDIT_SOCIAL_POST = "editSocialPost";

// --- Output helper ---
const socialPostToOutput = (post: SocialPost): Record<string, unknown> => ({
  id: post.id,
  title: post.title,
  url: post.url,
  date: post.date,
  content: post.content,
  useReply: post.useReply,
  type: post.type,
  entity: post.entity,
  media: post.media,
  actors: post.actors,
  groups: post.groups,
  keywords: post.keywords,
  platforms: post.platforms,
  publishCount: post.publishCount,
  status: post.status,
  scheduledAt: post.scheduledAt,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
});

// --- Register tools ---
export const registerSocialPostsTools = (
  server: McpServer,
  ctx: ServerContext,
) => {
  // --- findSocialPosts ---
  const findSocialPostsTool = defineMcpTool(
    FindSocialPostsInputSchema,
    async (input) => {
      const { q, status, type, entity, sort, order, start, end } = input;

      const findSocialPostQuery = ctx.db.manager
        .createQueryBuilder()
        .select()
        .from(SocialPostEntity, "sp");

      // Apply filters
      if (fp.O.isSome(type)) {
        findSocialPostQuery.where('"type" = :type', {
          type: type.value,
        });
      }
      if (fp.O.isSome(status)) {
        findSocialPostQuery.andWhere("status = :status", {
          status: status.value,
        });
      }
      if (fp.O.isSome(entity)) {
        findSocialPostQuery.andWhere("entity = :entity", {
          entity: entity.value,
        });
      }
      if (fp.O.isSome(q)) {
        findSocialPostQuery.andWhere(
          `(LOWER("content"->>'title') LIKE LOWER(:q) OR LOWER("content"->>'content') LIKE LOWER(:q))`,
          { q: `%${q.value}%` },
        );
      }

      // Build subquery for publishCount
      findSocialPostQuery
        .addSelect("*")
        .addSelect((s) => {
          s.from(SocialPostEntity, "sub_sp")
            .addSelect("count(*)", "publishCount")
            .where('"entity" = "sp"."entity"');
          if (fp.O.isSome(type)) {
            s.andWhere('"type" = :type', {
              type: type.value,
            });
          }
          return s;
        }, "publishCount")
        .addGroupBy("sp.id");

      // Apply sorting
      if (sort) {
        const sortField = sort === "scheduledAt" ? "scheduledAt" : sort;
        findSocialPostQuery.addOrderBy(`"sp"."${sortField}"`, order ?? "DESC");
      } else {
        findSocialPostQuery.addOrderBy('"sp"."createdAt"', "DESC");
      }

      // Apply pagination
      if (start !== undefined) {
        findSocialPostQuery.skip(Number(start));
      }
      if (end !== undefined) {
        findSocialPostQuery.take(Number(end));
      }

      ctx.logger.debug.log(
        `Find social posts %O`,
        findSocialPostQuery.getQueryAndParameters(),
      );

      try {
        const result = await pipe(
          TE.Do,
          TE.bind("data", () =>
            pipe(
              ctx.db.execQuery(() => findSocialPostQuery.getRawAndEntities()),
              TE.map((data) => data.raw),
              TE.chain((data) =>
                pipe(
                  data.map((d) => ({
                    ...d,
                    media: (Array.isArray(d.content.media)
                      ? d.content.media
                      : []
                    ).filter(Schema.is(UUID)),
                    actors: (d.content.actors ?? []).filter(Schema.is(UUID)),
                    groups: (d.content.groups ?? []).filter(Schema.is(UUID)),
                    keywords: (d.content.keywords ?? []).filter(
                      Schema.is(UUID),
                    ),
                  })),
                  TE.right,
                  TE.map(takeSocialPostRelations),
                  TE.chain((relations) =>
                    fetchSocialPostRelations(relations)(ctx),
                  ),
                  TE.map((relations) =>
                    data.map((post) => ({
                      ...post,
                      content: {
                        ...post.content,
                        media: relations.media.filter((m) =>
                          post.content.media.includes(m.id),
                        ),
                        actors: relations.actors.filter((a) =>
                          post.content.actors.includes(a.id),
                        ),
                        groups: relations.groups.filter((g) =>
                          post.content.groups.includes(g.id),
                        ),
                        keywords: relations.keywords.filter((k) =>
                          post.content.keywords.includes(k.id),
                        ),
                      },
                    })),
                  ),
                ),
              ),
              TE.chainEitherK((posts) => SocialPostIO.decodeMany(posts)),
            ),
          ),
          TE.bind("total", () =>
            ctx.db.execQuery(() => findSocialPostQuery.getCount()),
          ),
          TE.map(({ data, total }) => ({
            posts: data.map(socialPostToOutput),
            total,
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to find social posts",
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
        ctx.logger.error.log("findSocialPosts error: %O", err);
        throw new Error(
          `Failed to find social posts: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    FIND_SOCIAL_POSTS,
    {
      title: "Find social posts",
      description:
        "Search and list social posts in the database with filtering, sorting, and pagination.",
      annotations: { title: "Find social posts", readOnlyHint: true },
      inputSchema: findSocialPostsTool.inputSchema,
    },
    findSocialPostsTool.handler,
  );

  // --- createSocialPost ---
  const createSocialPostTool = defineMcpTool(
    CreateSocialPostInputSchema,
    async (input) => {
      const {
        title,
        url,
        date,
        content,
        useReply,
        mediaIds,
        actorIds,
        groupIds,
        keywordIds,
        platformIds,
      } = input;

      // Build platforms record from platformIds
      const platforms = platformIds.reduce(
        (acc: Record<string, boolean>, p: string) => {
          acc[p] = true;
          return acc;
        },
        { TG: false, IG: false },
      );

      const scheduledAt = addHours(new Date(), 0);

      try {
        const result = await pipe(
          TE.Do,
          TE.bind("media", () =>
            ctx.db.find(MediaEntity, { where: { id: In(mediaIds ?? []) } }),
          ),
          TE.bind("actors", () =>
            ctx.db.find(ActorEntity, { where: { id: In(actorIds ?? []) } }),
          ),
          TE.bind("groups", () =>
            ctx.db.find(GroupEntity, { where: { id: In(groupIds ?? []) } }),
          ),
          TE.bind("keywords", () =>
            ctx.db.find(KeywordEntity, {
              where: { id: In(keywordIds ?? []) },
            }),
          ),
          TE.chain(() =>
            ctx.db.save(SocialPostEntity, [
              {
                entity: "",
                type: "actors",
                content: {
                  title,
                  url,
                  date,
                  content,
                  useReply,
                  media: mediaIds ?? [],
                  actors: actorIds ?? [],
                  groups: groupIds ?? [],
                  keywords: keywordIds ?? [],
                  platforms,
                },
                status: TO_PUBLISH.literals[0],
                scheduledAt,
              },
            ]),
          ),
          TE.chain(([socialPost]) =>
            pipe(
              fetchSocialPostRelations(socialPost.content)(ctx),
              TE.mapLeft(toControllerError),
              TE.map((r): SocialPostEntityWithContent => ({
                ...socialPost,
                content: {
                  ...socialPost.content,
                  ...r,
                },
              })),
            ),
          ),
          TE.chainEitherK((post) => SocialPostIO.decodeSingle(post)),
          TE.map((sp) => ({
            post: socialPostToOutput(sp),
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to create social post",
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
        ctx.logger.error.log("createSocialPost error: %O", err);
        throw new Error(
          `Failed to create social post: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    CREATE_SOCIAL_POST,
    {
      title: "Create social post",
      description:
        "Create a new social post in the database with optional media, actors, groups, and keywords.",
      annotations: { title: "Create social post" },
      inputSchema: createSocialPostTool.inputSchema,
    },
    createSocialPostTool.handler,
  );

  // --- editSocialPost ---
  const editSocialPostTool = defineMcpTool(
    EditSocialPostInputSchema,
    async (input) => {
      const {
        id,
        title,
        url,
        date,
        content,
        useReply,
        mediaIds,
        actorIds,
        groupIds,
        keywordIds,
        platformIds,
      } = input;

      try {
        const sp = await ctx.db.manager.findOne(SocialPostEntity, {
          where: { id: Equal(id) },
        });
        if (!sp) throw new Error("Social post not found");

        const result = await pipe(
          TE.Do,
          TE.bind("media", () =>
            ctx.db.find(MediaEntity, { where: { id: In(mediaIds ?? []) } }),
          ),
          TE.bind("actors", () =>
            ctx.db.find(ActorEntity, { where: { id: In(actorIds ?? []) } }),
          ),
          TE.bind("groups", () =>
            ctx.db.find(GroupEntity, { where: { id: In(groupIds ?? []) } }),
          ),
          TE.bind("keywords", () =>
            ctx.db.find(KeywordEntity, {
              where: { id: In(keywordIds ?? []) },
            }),
          ),
          TE.chain(() =>
            ctx.db.save(SocialPostEntity, [
              {
                ...sp,
                content: {
                  ...sp.content,
                  ...(title !== undefined ? { title } : {}),
                  ...(url !== undefined ? { url } : {}),
                  ...(date !== undefined ? { date } : {}),
                  ...(content !== undefined ? { content } : {}),
                  ...(useReply !== undefined ? { useReply } : {}),
                  media: mediaIds ?? sp.content.media,
                  actors: actorIds ?? sp.content.actors,
                  groups: groupIds ?? sp.content.groups,
                  keywords: keywordIds ?? sp.content.keywords,
                  platforms: platformIds
                    ? platformIds.reduce(
                        (acc: Record<string, boolean>, p: string) => {
                          acc[p] = true;
                          return acc;
                        },
                        { ...sp.content.platforms },
                      )
                    : sp.content.platforms,
                },
                scheduledAt: sp.scheduledAt,
              },
            ]),
          ),
          TE.chain(([socialPost]) =>
            pipe(
              fetchSocialPostRelations(socialPost.content)(ctx),
              TE.mapLeft(toControllerError),
              TE.map((r): SocialPostEntityWithContent => ({
                ...socialPost,
                content: {
                  ...socialPost.content,
                  ...r,
                },
              })),
            ),
          ),
          TE.chainEitherK((post) => SocialPostIO.decodeSingle(post)),
          TE.map((sp) => ({
            post: socialPostToOutput(sp),
          })),
        )();

        if (fp.E.isLeft(result)) {
          throw new Error(
            (result.left as Error).message ?? "Failed to edit social post",
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
        ctx.logger.error.log("editSocialPost error: %O", err);
        throw new Error(
          `Failed to edit social post: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    },
  );

  server.registerTool(
    EDIT_SOCIAL_POST,
    {
      title: "Edit social post",
      description:
        "Edit an existing social post by ID. Only provided fields will be updated.",
      annotations: { title: "Edit social post" },
      inputSchema: editSocialPostTool.inputSchema,
    },
    editSocialPostTool.handler,
  );
};
