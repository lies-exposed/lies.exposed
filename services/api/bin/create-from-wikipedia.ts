import { loadENV } from "@liexp/core/lib/env/utils";
import { fp } from "@liexp/core/lib/fp";
import { createExcerptValue } from "@liexp/shared/lib/slate";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import { pipe } from "fp-ts/lib/function";
import snakeCase from "lodash/snakeCase";
import prompts from "prompts";
import { makeContext } from "../src/server";
import { ActorEntity } from "@entities/Actor.entity";
import { parseENV } from "@utils/env.utils";

/**
 * Usage ts-node ./bin/create-from-wikipedia $search
 *
 * $search      text used as query for wikipedia search api
 *
 * @returns void
 */
const run = async (): Promise<any> => {
  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? "../../.env");

  const [, , search] = process.argv;

  if (!search) {
    throw new Error('Missing "search" param');
  }

  const ctx = await pipe(
    parseENV(process.env),
    fp.TE.fromEither,
    fp.TE.chain((env) => makeContext({ ...env, TG_BOT_POLLING: false })),
    throwTE
  );

  D.enable(ctx.env.DEBUG);

  const result = await pipe(
    ctx.wp.search(search),
    fp.TE.map((r) => r.results),
    throwTE
  );

  ctx.logger.debug.log("Search results %O", result);

  const choice = await prompts({
    message: "Select correct page",
    type: "select",
    name: "page",
    choices: result.map((r) => ({ title: r.title, value: r.pageid })),
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
    fp.O.toUndefined
  );

  ctx.logger.debug.log("Page content %O", image);

  const username = pipe(
    page.fullurl.split("/"),
    fp.A.last,
    fp.O.map((n) => snakeCase(n.replaceAll("_", " "))),
    fp.O.getOrElse(() => snakeCase(search))
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
    throwTE
  );

  ctx.logger.debug.log("Created actor %O", actor);

  await throwTE(ctx.db.close());
  process.exit(0);
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
