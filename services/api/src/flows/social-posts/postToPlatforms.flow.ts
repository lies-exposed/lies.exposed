import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  PUBLISHED,
  type CreateSocialPost,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { Equal } from "typeorm";
import { postToIG } from "./postToIG.flow.js";
import { postToTG } from "./postToTG.flow.js";
import { SocialPostEntity } from "#entities/SocialPost.entity.js";
import { type TEReader } from "#flows/flow.types.js";

export const postToSocialPlatforms =
  ({
    platforms: _platforms,
    id,
    ...body
  }: CreateSocialPost & { id: UUID }): TEReader<SocialPostEntity> =>
  (ctx) => {
    const platforms = _platforms ?? { IG: false, TG: false };
    return pipe(
      fp.TE.Do,
      fp.TE.bind("socialPost", () => {
        return ctx.db.findOneOrFail(SocialPostEntity, {
          where: {
            id: Equal(id),
          },
        });
      }),
      fp.TE.bind("result", () => {
        return sequenceS(fp.TE.ApplicativePar)({
          ig: platforms.IG
            ? postToIG({ ...body, platforms }, (e) =>
                Promise.resolve({
                  code: "invalid",
                }),
              )(ctx)
            : fp.TE.right(undefined),
          tg: platforms.TG
            ? postToTG({ ...body, platforms, id })(ctx)
            : fp.TE.right(undefined),
        });
      }),
      fp.TE.chain(({ result, socialPost }) =>
        ctx.db.save(SocialPostEntity, [
          {
            id,
            result: {
              ig: result.ig ?? socialPost.result.ig,
              tg: result.tg ?? socialPost.result.tg,
            },
            status: PUBLISHED.value,
          },
        ]),
      ),
      fp.TE.map((results) => results[0]),
    );
  };
