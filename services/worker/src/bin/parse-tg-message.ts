import * as fs from "fs";
import * as path from "path";
import { parseTGMessageFlow } from "@liexp/backend/lib/flows/tg/parseMessages.flow.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { separateTE, throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { type CommandFlow } from "./command.type.js";

/**
 * Usage parse-tg-message $messageN $delete?
 *
 * $messageN    Id of json file stored in ../temp/tg/messages
 * $delete      "true" to delete the file on parse completed, Optional
 *
 * @returns void
 */
export const parseTGMessage: CommandFlow = async (ctx, args): Promise<any> => {
  const [tgNumber, _deleteFile] = args;

  const messagesFolder = path.resolve(process.cwd(), `temp/tg/messages`);

  const messageFile =
    tgNumber === "latest"
      ? pipe(
          fs.readdirSync(messagesFolder),
          fp.A.last,
          fp.O.map((latest) => [latest]),
          fp.O.getOrElse((): string[] => []),
        )
      : tgNumber === "all"
        ? fs.readdirSync(messagesFolder)
        : [`${parseInt(tgNumber, 10)}.json`];

  if (!messageFile) {
    ctx.logger.info.log("No file found to parse.");
    return;
  }

  const deleteFile = _deleteFile === "true";

  ctx.logger.info.log("Reading message %d", messageFile.length);

  const result = await pipe(
    messageFile.map((f) =>
      parseTGMessageFlow(path.resolve(messagesFolder, f), deleteFile)(ctx),
    ),
    separateTE,
    fp.T.map(({ left, right }) => {
      left.forEach((l) => {
        ctx.logger.error.log(`Message failed %O`, l);
      });

      return right;
    }),
    fp.TE.fromTask,
    throwTE,
  );

  return result;
};
