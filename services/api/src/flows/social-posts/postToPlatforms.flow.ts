import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { type CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost.js";
import { sequenceS } from "fp-ts/Apply";
import type TelegramBot from "node-telegram-bot-api";
import { postToIG } from "./postToIG.flow.js";
import { postToTG } from "./postToTG.flow.js";
import { type TEFlow } from "#flows/flow.types.js";

export const postToSocialPlatforms: TEFlow<
  [UUID, CreateSocialPost],
  { tg?: TelegramBot.Message[]; ig: any }
> =
  (ctx) =>
  (id, { platforms: _platforms, ...body }) => {
    const platforms = _platforms ?? { IG: false, TG: false };
    return pipe(
      sequenceS(fp.TE.ApplicativePar)({
        ig: platforms.IG
          ? postToIG(ctx)({ ...body, platforms }, (e) =>
              Promise.resolve({
                code: "invalid",
              }),
            )
          : fp.TE.right(undefined),
        tg: platforms.TG
          ? postToTG(ctx)(id, { ...body, platforms })
          : fp.TE.right(undefined),
      }),
    );
  };
