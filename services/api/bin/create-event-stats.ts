import { createStatsByEntityType } from "@flows/stats/createStatsByEntityType.flow";
import { throwTE } from "@liexp/shared/utils/task.utils";
import dotenv from "dotenv";
import { PathReporter } from "io-ts/lib/PathReporter";
import { makeContext } from "../src/server";

const run = async () => {
  const [, , type, id] = process.argv;

  dotenv.config();

  const ctx = await throwTE(
    makeContext({ ...process.env, TG_BOT_POLLING: "false" })
  );

  const result = await createStatsByEntityType(ctx)(type as any, id)();

  if (result._tag === "Left") {
    ctx.logger.error.log("Error %O", result.left);
    ctx.logger.error.log(
      "Details %O",
      PathReporter.report((result.left.details as any).errors)
    );
  } else {
    ctx.logger.info.log("Output: %O", result.right);
  }
};

run().catch(console.error);
