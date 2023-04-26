import { parseTGMessageFlow } from "@flows/tg/parseMessages.flow";
import { fp } from "@liexp/core/src/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { loadENV, parseENV } from "@utils/env.utils";
import D from "debug";
import { pipe } from "fp-ts/lib/function";
import * as fs from "fs";
import * as path from "path";
import { makeContext } from "../src/server";

/**
 * Usage ts-node ./bin/parse-tg-message $messageN $delete?
 *
 * $messageN    Id of json file stored in ../temp/tg/messages
 * $delete      "true" to delete the file on parse completed, Optional
 *
 * @returns void
 */
const run = async (): Promise<any> => {
  loadENV();

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

  const ctx = await pipe(
    parseENV(process.env),
    fp.TE.fromEither,
    fp.TE.chain((env) => makeContext({ ...env, TG_BOT_POLLING: false })),
    throwTE
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
