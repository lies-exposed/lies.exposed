import * as fs from "fs";
import * as path from "path";
// import * as TE from "fp-ts/TaskEither";
import dotenv from "dotenv";

const run = async () => {
  dotenv.config();

  const messagesDir = path.resolve(__dirname, `../temp/tg/messages`);

  const messageFiles = fs.readdirSync(messagesDir, { encoding: "utf-8" });

  await Promise.all(
    messageFiles.map((m) => {
      console.log(m);
      const message = fs.readFileSync(path.resolve(messagesDir, m), "utf-8");
      const json = JSON.parse(message);
      fs.writeFileSync(
        path.resolve(messagesDir, m),
        JSON.stringify({ ...json, chat: undefined, from: undefined }, null, 2),
        "utf-8"
      );
    })
  );
};

void run().catch(console.error);
