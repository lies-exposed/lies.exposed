import { SocialPostEntity } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  PUBLISHED,
  type CreateSocialPost,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { Equal } from "typeorm";
import { type RTE } from "../../types.js";
import { postToIG } from "./postToIG.flow.js";
import { postToTG } from "./postToTG.flow.js";
import { toWorkerError } from "#io/worker.error.js";

export const postToSocialPlatforms =
  ({
    platforms: _platforms,
    id,
    ...body
  }: CreateSocialPost & { id: UUID }): RTE<SocialPostEntity> =>
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
        pipe(
          ctx.db.save(SocialPostEntity, [
            {
              id,
              result: {
                ig: result.ig ?? socialPost.result.ig,
                tg: result.tg ?? socialPost.result.tg,
              },
              status: PUBLISHED.Type,
            },
          ]),
          fp.TE.mapLeft(toWorkerError),
        ),
      ),
      fp.TE.map((results) => results[0]),
    );
  };
