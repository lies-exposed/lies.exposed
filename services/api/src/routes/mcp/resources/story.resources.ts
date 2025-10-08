import { StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import {
  ResourceTemplate,
  type McpServer,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { Equal } from "typeorm";
import { type ServerContext } from "../../../context/context.type.js";

export const registerStoryResources = (
  server: McpServer,
  ctx: ServerContext,
) => {
  server.registerResource(
    "story",
    new ResourceTemplate("story://{id}", {
      list: (_extra) => {
        return pipe(
          ctx.db.find(StoryEntity, {
            take: 20,
            order: { createdAt: "DESC" },
          }),
          fp.TE.map((stories) => ({
            resources: stories.map((story) => ({
              name: story.title,
              uri: `story://${story.id}`,
              title: `Story: ${story.title}`,
              description: story.excerpt ?? story.title,
            })),
          })),
          throwTE,
        );
      },
    }),
    {
      title: "Get story by its ID",
      description: "Retrieve a Story from DB by its UUID",
    },
    async (uri, { id }) => {
      return pipe(
        ctx.db.findOneOrFail(StoryEntity, {
          where: {
            id: Equal(id as UUID),
          },
        }),
        fp.TE.map((story) => ({
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(story),
            },
          ],
        })),
        throwTE,
      );
    },
  );
};
