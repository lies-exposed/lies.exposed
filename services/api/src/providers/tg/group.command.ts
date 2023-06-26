import { fp } from "@liexp/core/lib/fp";
import { getUsernameFromDisplayName } from "@liexp/shared/lib/helpers/actor";
import { URL } from '@liexp/shared/lib/io/http/Common';
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { type BotBrotherCtx } from "bot-brother";
import { pipe } from "fp-ts/lib/function";
import { GroupEntity } from "@entities/Group.entity";
import { fetchGroupFromWikipedia } from "@flows/groups/fetchGroupFromWikipedia";
import { type RouteContext } from "@routes/route.types";

const getSuccessMessage = (g: GroupEntity, baseUrl: string): string =>
  `Group <a href="${baseUrl}/group/${g.id}">${g.name}</a>`;

export const groupCommand = ({
  logger,
  db,
  wp,
  tg,
  env,
  ...tgContext
}: RouteContext): BotBrotherCtx => {
  tg.bot
    .command("group")
    .invoke(async (ctx) => {
      ctx.search = ctx.args.join(" ");
      const username = getUsernameFromDisplayName(ctx.search);
      logger.debug.log("/group %s", ctx.search, username);

      const group = await pipe(
        db.findOne(GroupEntity, { where: { username } }),
        fp.TE.map(fp.O.toNullable),
        throwTE
      );
      if (group) {
        await ctx.sendMessage(getSuccessMessage(group, env.WEB_URL), {
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
      if (URL.is(ctx.answer) || !ctx.answer) {
        return;
      }
      logger.debug.log("User pick %O", ctx.answer);
      const pageId = ctx.answer;
      ctx.hideKeyboard();
      const groupData = await pipe(
        fetchGroupFromWikipedia({ logger, wp, tg, db, env, ...tgContext })(
          pageId
        ),
        throwTE
      );

      const [group] = await pipe(
        db.save(GroupEntity, [{ ...groupData, members: [] }]),
        throwTE
      );

      return await ctx.sendMessage(getSuccessMessage(group, env.WEB_URL), {
        parse_mode: "HTML",
      });
    });

  return tg.bot;
};
