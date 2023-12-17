import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
// eslint-disable-next-line import/no-named-as-default
import prompts from "prompts";
import { startContext, stopContext } from "./start-ctx.js";
import { fetchActorFromWikipedia } from "#flows/actors/fetchAndCreateActorFromWikipedia.js";
import { fetchAndCreateAreaFromWikipedia } from "#flows/areas/fetchAndCreateAreaFromWikipedia.js";
import { fetchGroupFromWikipedia } from "#flows/groups/fetchGroupFromWikipedia.js";

/**
 * Usage create-from-wikipedia $type $search
 *
 * $type        type of entity to create  (actor|area|group)
 * $search      text used as query for wikipedia search api
 *
 * @returns void
 */
const run = async (): Promise<any> => {
  const [, , type, search] = process.argv;

  if (!["area", "actor", "group"].includes(type)) {
    throw new Error(
      `Wrong type ${type} given. Allowed types are: 'actor', 'area', 'group'`,
    );
  }

  if (!search) {
    throw new Error('Missing "search" param');
  }

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

  const wpResult = await pipe(
    ctx.wp.search(search),
    fp.TE.map((r) => r.results),
    throwTE,
  );

  ctx.logger.debug.log("Search results %O", wpResult);

  const choice = await prompts({
    message: "Select correct page",
    type: "select",
    name: "page",
    choices: wpResult.map((r) => ({ title: r.title, value: r.title })),
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

  let result;
  if (type === "area") {
    result = await pipe(
      fetchAndCreateAreaFromWikipedia(ctx)(String(page.pageid)),
      throwTE,
    );
  } else if (type === "actor") {
    result = await pipe(
      fetchActorFromWikipedia(ctx)(String(page.pageid)),
      throwTE,
    );
  } else if (type === "group") {
    result = await pipe(
      fetchGroupFromWikipedia(ctx)(String(page.pageid)),
      throwTE,
    );
  }

  ctx.logger.debug.log("Created %s %O", type, result);

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
