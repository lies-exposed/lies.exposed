import { fp } from "@liexp/core/lib/fp";
import { URL } from "@liexp/shared/lib/io/http/Common";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { type BotBrotherCtx } from "bot-brother";
import { pipe } from "fp-ts/lib/function";
import kebabCase from "lodash/kebabCase";
import { ActorEntity } from "@entities/Actor.entity";
import { fetchActorFromWikipedia } from "@flows/actors/fetchActorFromWikipedia";
import { type RouteContext } from "@routes/route.types";

const getSuccessMessage = (actor: ActorEntity, baseUrl: string): string =>
  `Actor <a href="${baseUrl}/actors/${actor.id}">${actor.fullName}</a>`;

export const actorCommand = ({
  logger,
  wp,
  tg,
  db,
  env,
  ...rest
}: RouteContext): BotBrotherCtx => {
  tg.bot
    .command("actor")
    .invoke(async (ctx) => {
      ctx.search = ctx.args.join(" ");
      const username = kebabCase(ctx.search);
      logger.debug.log("Looking for actor %s (%s)", ctx.search, username);

      const actor = await pipe(
        db.findOne(ActorEntity, { where: { username } }),
        fp.TE.map(fp.O.toNullable),
        throwTE
      );

      if (actor) {
        await ctx.sendMessage(getSuccessMessage(actor, env.WEB_URL), {
          parse_mode: "HTML",
        });
        return;
      }

      await pipe(
        wp.search(ctx.search),
        fp.TE.map((q) =>
          q.results.slice(0, 5).map((s) => ({
            [s.title]: { value: s.pageid },
          }))
        ),
        fp.TE.map((options) => {
          ctx.keyboard([options]);
          return undefined;
        }),
        throwTE
      );

      await ctx.sendMessage(`Looking for ${ctx.search} on Wikipedia...`);
    })
    .answer(async (ctx) => {
      if (!ctx.answer || URL.is(ctx.answer)) {
        return;
      }
      logger.debug.log("User pick %O", ctx.answer);
      const pageId = ctx.answer;
      ctx.hideKeyboard();
      const actorData = await pipe(
        fetchActorFromWikipedia({
          db,
          logger,
          wp,
          tg,
          env,
          ...rest,
        })(pageId),
        throwTE
      );

      const actor = await pipe(
        db.save(ActorEntity, [
          {
            ...actorData,
            bornOn: actorData.bornOn as any,
            diedOn: actorData.diedOn as any,
          },
        ]),
        fp.TE.map((r) => r[0]),
        throwTE
      );

      await ctx.sendMessage(getSuccessMessage(actor, env.WEB_URL), {
        parse_mode: "HTML",
      });
    });
  return tg.bot;
};
