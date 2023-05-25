import * as fs from "fs";
import * as path from "path";
import { loadENV } from "@liexp/core/lib/env/utils";
import { fp } from "@liexp/core/lib/fp";
import { separateTE, throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import { pipe } from "fp-ts/lib/function";
import { startContext, stopContext } from "./start-ctx";
import { parseTGMessageFlow } from "@flows/tg/parseMessages.flow";

/**
 * Usage ts-node ./bin/parse-tg-message $messageN $delete?
 *
 * $messageN    Id of json file stored in ../temp/tg/messages
 * $delete      "true" to delete the file on parse completed, Optional
 *
 * @returns void
 */
const run = async (): Promise<any> => {
  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? "../../.env");

  const [, , tgNumber, _deleteFile] = process.argv;

  const messagesFolder = path.resolve(__dirname, `../temp/tg/messages`);

  const messageFile =
    tgNumber === "latest"
      ? pipe(
          fs.readdirSync(messagesFolder),
          fp.A.last,
          fp.O.map((latest) => [latest]),
          fp.O.getOrElse((): string[] => [])
        )
      : tgNumber === "all"
      ? fs.readdirSync(messagesFolder)
      : [`${parseInt(tgNumber, 10)}.json`];

  if (!messageFile) {
    // eslint-disable-next-line no-console
    console.log("No file found to parse.");
    return;
  }

  const deleteFile = _deleteFile === "true";

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

  ctx.logger.info.log("Reading message %d", messageFile.length);
  const parseTGMessage = parseTGMessageFlow(ctx);

  const result = await pipe(
    messageFile.map((f) =>
      parseTGMessage(path.resolve(messagesFolder, f), deleteFile)
    ),
    separateTE,
    fp.T.map(({ left, right }) => {
      left.forEach((l) => {
        ctx.logger.error.log(`Message failed %O`, l);
      });

      return right;
    }),
    fp.TE.fromTask,
    throwTE
  );

  await stopContext(ctx);

  return result;
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
