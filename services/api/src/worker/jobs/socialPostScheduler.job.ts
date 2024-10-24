import { fp } from "@liexp/core/lib/fp/index.js";
import { PUBLISHED, TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost.js";
import { pipe } from "fp-ts/lib/function.js";
import { LessThanOrEqual } from "typeorm";
import { type CronJobTE } from "./cron-task.type.js";
import { SocialPostEntity } from "#entities/SocialPost.entity.js";
import { postToSocialPlatforms } from "#flows/social-posts/postToPlatforms.flow.js";

export const postOnSocialJob: CronJobTE = (opts) => (ctx) => {
  ctx.logger.info.log("Start posting on social task...");

  const date = opts === "manual" || opts === "init" ? new Date() : opts;
  return pipe(
    ctx.db.find(SocialPostEntity, {
      where: {
        status: TO_PUBLISH.value,
        scheduledAt: LessThanOrEqual(date),
      },
      take: 5,
    }),
    fp.TE.chain((pp) =>
      pipe(
        pp.map((p) =>
          pipe(
            postToSocialPlatforms(p.entity, p.content)(ctx),
            fp.TE.chain(({ ig, tg }) =>
              ctx.db.save(SocialPostEntity, [
                {
                  ...p,
                  status: PUBLISHED.value,
                  result: {
                    ig: ig ?? p.result?.ig,
                    tg: tg ?? p.result?.tg,
                  },
                },
              ]),
            ),
          ),
        ),
        fp.A.sequence(fp.TE.ApplicativePar),
      ),
    ),
    fp.TE.matchE(
      (e) => {
        return fp.T.of(
          ctx.logger.error.log("Error while publishing social posts: %O", e),
        );
      },
      () => {
        return fp.T.of(
          ctx.logger.info.log("Social posts published successfully"),
        );
      },
    ),
  );
};
