import { loadENV } from "@liexp/core/lib/env/utils.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import D from "debug";
import { pipe } from "fp-ts/lib/function.js";
import { type ClientContext } from "../context.js";
import { userLogin } from "../flows/userLogin.flow.js";
import { loadContext } from "../load-context.js";
import { type CommandFlow } from "./CommandFlow.js";
import { chatCommand } from "./chat.command.js";
import { processJobCommand } from "./process-job.command.js";

const commands: Record<string, CommandFlow> = {
  "process-job": processJobCommand,
  chat: chatCommand,
};

const run = async ([command, ...args]: string[]): Promise<void> => {
  if (!command || commands[command] === undefined) {
    // eslint-disable-next-line no-console
    console.error(
      `No valid command provided: ${command}\nAvailable commands: ${Object.keys(commands).join(", ")}`,
    );
    process.exit(1);
  }

  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? "../../.env");

  let token: string = "invalid-token";
  let ctx: ClientContext | undefined = undefined;
  try {
    ctx = await pipe(
      loadContext(() => token),
      throwTE,
    );

    token = await pipe(userLogin()(ctx), throwTE);

    D.enable(fp.O.getOrElse(() => "-")(ctx.env.DEBUG));

    ctx.logger.info.log("Running command %s with args: %O", command, args);

    await commands[command](ctx, args);
  } catch (e) {
    ctx?.logger.error.log("Error running command %s: %O", command, e);
    throw e;
  }
};

void run(process.argv.splice(2))
  .then(() => process.exit(0))
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
