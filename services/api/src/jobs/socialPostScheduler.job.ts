import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { pipe } from "fp-ts/lib/function";
import Cron from "node-cron";
import { LessThanOrEqual } from "typeorm";
import {
  PUBLISHED,
  SocialPostEntity,
  TO_PUBLISH,
} from "@entities/SocialPost.entity";
import { postToTG } from "@flows/events/postToTG.flow";
import { type RouteContext } from "@routes/route.types";

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
              postToTG(ctx)(p.entity, p.content),
              fp.TE.chain((r) =>
                ctx.db.save(SocialPostEntity, [
                  { ...p, status: PUBLISHED.value, result: r },
                ])
              )
            )
          ),
          fp.A.sequence(fp.TE.ApplicativePar)
        )
      ),
      throwTE
    );
  });
