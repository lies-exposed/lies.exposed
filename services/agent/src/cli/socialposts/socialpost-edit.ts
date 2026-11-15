import { EditSocialPostInputSchema } from "@liexp/shared/lib/mcp/schemas/socialposts.schemas.js";
import { makeCommand } from "../run-command.js";

interface SocialPostEditBody {
  actors: readonly string[];
  content?: string;
  createdAt: string;
  date: string;
  entity: string;
  groups: readonly string[];
  id: string;
  keywords: readonly string[];
  media: readonly string[];
  platforms?: Record<string, boolean>;
  schedule?: number;
  url?: string;
  useReply: boolean;
  entities?: readonly string[];
  nation?: string;
  quote?: string;
  excerpt?: string;
  status: string;
}

export const socialPostEdit = makeCommand(
  EditSocialPostInputSchema,
  {
    usage: "socialposts edit",
    description: "Edit an existing social post by UUID.",
    output: "JSON updated social post object",
  },
  (input, ctx) => {
    ctx.logger.debug.log("socialpost-edit input: %O", input);
    const { id, ...rest } = input;

    // Build body with proper field names matching EditSocialPost schema
    // EditSocialPost expects: media[], actors[], groups[], keywords[] as UUID arrays
    const body: SocialPostEditBody = { ...rest } as SocialPostEditBody;

    // Map mediaIds -> media (array of UUIDs for edit)
    if (body.mediaIds !== undefined) {
      body.media = body.mediaIds;
      delete body.mediaIds;
    }

    // Map actorIds -> actors (array of UUIDs for edit)
    if (body.actorIds !== undefined) {
      body.actors = body.actorIds;
      delete body.actorIds;
    }

    // Map groupIds -> groups (array of UUIDs for edit)
    if (body.groupIds !== undefined) {
      body.groups = body.groupIds;
      delete body.groupIds;
    }

    // Map keywordIds -> keywords (array of UUIDs for edit)
    if (body.keywordIds !== undefined) {
      body.keywords = body.keywordIds;
      delete body.keywordIds;
    }

    // Map platformIds -> platforms (Record format)
    if (rest.platformIds !== undefined && rest.platformIds !== null) {
      body.platforms = {
        IG: rest.platformIds.includes("IG"),
        TG: rest.platformIds.includes("TG"),
      };
    }

    return ctx.api.SocialPosts.Edit({
      Params: { id },
      Body: body,
    });
  },
);
