import { parseTGMessageFlow } from "@flows/tg/parseMessages.flow";
import { loadENV } from "@liexp/core/lib/env/utils";
import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import { pipe } from "fp-ts/lib/function";
import * as fs from "fs";
import * as path from "path";
import { startContext, stopContext } from "./start-ctx";

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

  const tgN =
    tgNumber === "latest"
      ? pipe(fs.readdirSync(messagesFolder), fp.A.last, fp.O.toUndefined)
      : `${parseInt(tgNumber, 10)}.json`;

  if (!tgN) {
    // eslint-disable-next-line no-console
    console.log("No file found to parse.");
    return;
  }
  const deleteFile = _deleteFile === "true";

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

  const messageFile = path.resolve(messagesFolder, tgN);

  const result = await pipe(
    parseTGMessageFlow(ctx)(messageFile, deleteFile),
    throwTE
  );

  await stopContext(ctx);

  return result;
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
