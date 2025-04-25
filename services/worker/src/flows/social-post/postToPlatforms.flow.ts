import { SocialPostEntity } from "@liexp/backend/lib/entities/SocialPost.entity.js";
import { getSocialPostById } from "@liexp/backend/lib/flows/social-post/getSocialPostById.flow.js";
import { SocialPostIO } from "@liexp/backend/lib/io/socialPost.io.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  PUBLISHED,
  type CreateSocialPost,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type RTE } from "../../types.js";
import { postToIG } from "./postToIG.flow.js";
import { postToTG } from "./postToTG.flow.js";
import { toWorkerError } from "#io/worker.error.js";

export const postToSocialPlatforms =
  ({
    platforms: _platforms,
    id,
    ...body
  }: {
    id: UUID;
    platforms: CreateSocialPost["platforms"];
  }): RTE<SocialPostEntity> =>
  (ctx) => {
    const platforms = _platforms ?? { IG: false, TG: false };
    return pipe(
      fp.TE.Do,
      fp.TE.bind("socialPost", () => {
        return pipe(
          getSocialPostById(id)(ctx),
          fp.TE.chainEitherK((post) =>
            SocialPostIO.decodeSingle(post, ctx.env.SPACE_ENDPOINT),
          ),
        );
      }),
      fp.TE.bind("result", ({ socialPost }) => {
        return sequenceS(fp.TE.ApplicativePar)({
          ig: platforms.IG
            ? postToIG({ ...socialPost, platforms }, (e) =>
                Promise.resolve({
                  code: "invalid",
                }),
              )(ctx)
            : fp.TE.right(undefined),
          tg: platforms.TG
            ? postToTG({ ...socialPost, platforms, id })(ctx)
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
              status: PUBLISHED.literals[0],
            },
          ]),
          fp.TE.mapLeft(toWorkerError),
        ),
      ),
      fp.TE.map((results) => results[0]),
    );
  };
