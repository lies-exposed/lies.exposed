import { fp } from "@liexp/core/lib/fp";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import { pipe } from "fp-ts/lib/function";
import snakeCase from "lodash/snakeCase";
// eslint-disable-next-line import/no-named-as-default
import prompts from "prompts";
import { startContext, stopContext } from "./start-ctx";
import { ActorEntity } from "@entities/Actor.entity";

/**
 * Usage create-from-wikipedia $search
 *
 * $search      text used as query for wikipedia search api
 *
 * @returns void
 */
const run = async (): Promise<any> => {
  const [, , search] = process.argv;

  if (!search) {
    throw new Error('Missing "search" param');
  }

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

  const result = await pipe(
    ctx.wp.search(search),
    fp.TE.map((r) => r.results),
    throwTE,
  );

  ctx.logger.debug.log("Search results %O", result);

  const choice = await prompts({
    message: "Select correct page",
    type: "select",
    name: "page",
    choices: result.map((r) => ({ title: r.title, value: r.title })),
  });

  const page = await pipe(ctx.wp.parse(choice.page), throwTE);

  ctx.logger.debug.log("Page %O", page);

  const intro = await page.intro({ fields: ["summary"] });
  ctx.logger.debug.log("Page intro %s", intro);

  const media = await page.media();
  const image = pipe(
    media.items.filter((i) => i.type === "image"),
    fp.A.head,
    fp.O.chainNullableK((r) => r.srcset?.[0]?.src),
    fp.O.map((url) => `https:${url}`),
    fp.O.toUndefined,
  );

  ctx.logger.debug.log("Page content %O", image);

  const username = pipe(
    page.fullurl.split("/"),
    fp.A.last,
    fp.O.map((n) => snakeCase(n.replaceAll("_", " "))),
    fp.O.getOrElse(() => snakeCase(search)),
  );

  const [actor] = await pipe(
    ctx.db.save(ActorEntity, [
      {
        fullName: page.title,
        username,
        excerpt: createExcerptValue(intro),
        avatar: image,
        color: generateRandomColor(),
      },
    ]),
    throwTE,
  );

  ctx.logger.debug.log("Created actor %O", actor);

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
