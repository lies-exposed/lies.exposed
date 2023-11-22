import { fp, pipe } from "@liexp/core/lib/fp";
import {
    type CreateSocialPost,
} from "@liexp/shared/lib/io/http/SocialPost";
import { sequenceS } from 'fp-ts/Apply';
import { type UUID } from "io-ts-types/lib/UUID";
import type TelegramBot from "node-telegram-bot-api";
import { postToIG } from './postToIG.flow';
import { postToTG } from './postToTG.flow';
import { type TEFlow } from "@flows/flow.types";

export const postToSocialPlatforms: TEFlow<[UUID, CreateSocialPost], { tg?: TelegramBot.Message; ig: any }> =
  (ctx) => (id, { platforms: _platforms, ...body }) => {
    const platforms = _platforms ?? { IG: false, TG: false }
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
