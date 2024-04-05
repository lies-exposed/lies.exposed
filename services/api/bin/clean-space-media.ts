import { pipe } from "@liexp/core/lib/fp/index.js";
import { formatDistanceToNow } from "@liexp/shared/lib/utils/date.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
// eslint-disable-next-line import/no-named-as-default
import prompts from "prompts";
import { startContext, stopContext } from "./start-ctx.js";
import { getOrphanMediaFlow } from '#flows/media/getOrphanMedia.flow.js';

/**
 * Usage clean-space-media [--dry] [-i|--interactive]
 *
 * -i      interactive mode
 * --dry    dry mode
 *
 * @returns void
 */
const run = async (): Promise<any> => {
  const dry = !!process.argv.find((a) => a === "--dry");
  const interactive = !!process.argv.find(
    (a) => a === "-i" || a === "--interactive",
  );

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

  const result = await pipe(
    getOrphanMediaFlow(ctx)(),
    throwTE,
  );

  ctx.logger.info.log("Orphan media count: %d", result.orphans.length);

  for await (const e of result.orphans) {
    const output = {
      age: e.LastModified ? formatDistanceToNow(e.LastModified) : "unknown",
      url: `https://${ctx.env.SPACE_BUCKET}.${ctx.env.SPACE_REGION}.cdn.${ctx.env.SPACE_ENDPOINT}/${e.Key}`,
    };

    ctx.logger.info.log("Orphan media %O", output);

    const choice =
      interactive && !dry
        ? await prompts({
            message: "Delete media?",
            type: "select",
            name: "del",
            choices: [true, false].map((r) => ({
              title: r ? "yes" : "no",
              value: r,
            })),
          })
        : { del: !dry };

    if (choice.del) {
      await pipe(
        ctx.s3.deleteObject({ Bucket: ctx.env.SPACE_BUCKET, Key: e.Key }),
        throwTE,
      );
    }
  }

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
