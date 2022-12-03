import * as fs from "fs";
import * as path from "path";
import { makeContext } from "../src/server";
// import * as TE from "fp-ts/TaskEither";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { createFromTGMessage } from "../src/flows/event-suggestion/createFromTGMessage.flow";
import dotenv from "dotenv";

const run = async () => {
  const [, , tgNumber] = process.argv;

  const tgN = parseInt(tgNumber, 10);

  dotenv.config();

  const ctx = await throwTE(
    makeContext({ ...process.env, TG_BOT_POLLING: "false" })
  );
  const messageFile = path.resolve(
    __dirname,
    `../temp/tg/messages/${tgN}.json`
  );

  const message = fs.readFileSync(messageFile, "utf-8");
  const result = await throwTE(
    createFromTGMessage(ctx)(JSON.parse(message), {
      type: "text",
    })
  );

  console.log(result);
};

void run().catch(console.error);
