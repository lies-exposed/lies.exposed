import * as fs from "fs";
import * as path from "path";
import { fp } from "@liexp/core/src/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import dotenv from "dotenv";
import { pipe } from "fp-ts/lib/function";
import { makeContext } from "../src/server";
import { parseTGMessageFlow } from "@flows/tg/parseMessages.flow";

dotenv.config({
  path: path.resolve(process.cwd(), process.env.DOTENV_CONFIG ?? "../../.env"),
});

/**
 * Usage ts-node ./bin/parse-tg-message $messageN $delete?
 *
 * $messageN    Id of json file stored in ../temp/tg/messages
 * $delete      "true" to delete the file on parse completed, Optional
 *
 * @returns void
 */
const run = async (): Promise<any> => {
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

  const ctx = await throwTE(
    makeContext({ ...process.env, TG_BOT_POLLING: "false" })
  );

  D.enable(ctx.env.DEBUG);

  const messageFile = path.resolve(messagesFolder, tgN);

  const result = await pipe(
    parseTGMessageFlow(ctx)(messageFile, deleteFile),
    throwTE
  );

  await throwTE(ctx.db.close());

  return result;
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
