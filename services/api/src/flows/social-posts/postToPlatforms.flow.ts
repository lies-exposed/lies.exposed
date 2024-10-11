import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { type CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import type TelegramBot from "node-telegram-bot-api";
import { postToIG } from "./postToIG.flow.js";
import { postToTG } from "./postToTG.flow.js";
import { type TEReader } from "#flows/flow.types.js";

export const postToSocialPlatforms =
  (
    id: UUID,
    { platforms: _platforms, ...body }: CreateSocialPost,
  ): TEReader<{ tg?: TelegramBot.Message[]; ig: any }> =>
  (ctx) => {
    const platforms = _platforms ?? { IG: false, TG: false };
    return pipe(
      sequenceS(fp.TE.ApplicativePar)({
        ig: platforms.IG
          ? postToIG({ ...body, platforms }, (e) =>
              Promise.resolve({
                code: "invalid",
              }),
            )(ctx)
          : fp.TE.right(undefined),
        tg: platforms.TG
          ? postToTG(id, { ...body, platforms })(ctx)
          : fp.TE.right(undefined),
      }),
    );
  };
