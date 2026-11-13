import { type CreateSocialPost } from "@liexp/io/lib/http/SocialPost.js";
import { CreateSocialPostInputSchema } from "@liexp/shared/lib/mcp/schemas/socialposts.schemas.js";
import { makeCommand } from "../run-command.js";

export const socialPostCreate = makeCommand(
  CreateSocialPostInputSchema,
  {
    usage: "socialposts create",
    description: "Create a new social post.",
    output: "JSON created social post object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("socialpost-create input: %O", input);

    // Determine parent entity from provided IDs (priority: actors > groups > keywords)
    let parentId = "";
    let parentType: "actors" | "groups" | "keywords" = "actors";

    if (input.actorIds.length > 0) {
      parentId = input.actorIds[0];
      parentType = "actors";
    } else if (input.groupIds.length > 0) {
      parentId = input.groupIds[0];
      parentType = "groups";
    } else if (input.keywordIds.length > 0) {
      parentId = input.keywordIds[0];
      parentType = "keywords";
    }

    // Build body matching CreateSocialPost schema structure
    const body: CreateSocialPost = {
      title: input.title,
      url: input.url,
      date: input.date,
      content: input.content,
      useReply: input.useReply,
      media: input.mediaIds.map((id) => ({
        id,
        type: "photo",
        media: "",
        thumbnail: "",
      })),
      actors: input.actorIds.map((id) => ({ id })),
      groups: input.groupIds.map((id) => ({ id })),
      keywords: input.keywordIds.map((id) => ({ id })),
      platforms: {
        IG: input.platformIds.includes("IG"),
        TG: input.platformIds.includes("TG"),
      },
    };

    return ctx.api.SocialPosts.Create({
      Params: { id: parentId, type: parentType },
      Body: body,
    });
  },
);
