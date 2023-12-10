import { fp } from "@liexp/core/lib/fp/index.js";
import { PUBLISHED, TO_PUBLISH } from "@liexp/shared/lib/io/http/SocialPost.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import Cron from "node-cron";
import { LessThanOrEqual } from "typeorm";
import { SocialPostEntity } from "#entities/SocialPost.entity.js";
import { postToSocialPlatforms } from "#flows/social-posts/postToPlatforms.flow.js";
import { type RouteContext } from "#routes/route.types.js";

export const postOnSocialJob = (ctx: RouteContext): Cron.ScheduledTask =>
  Cron.schedule(ctx.env.SOCIAL_POSTING_CRON, (opts) => {
    ctx.logger.info.log("Start posting on social task...");
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    const date = opts === "manual" || opts === "init" ? new Date() : opts;
    void pipe(
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
              postToSocialPlatforms(ctx)(p.entity, p.content),
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
      throwTE,
    ).catch((err) => {
      ctx.logger.error.log(`Social Posting error %O`, err);
    });
  });
