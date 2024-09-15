import * as fs from "fs";
import * as path from "path";
import { type CommandFlow } from "./command.type.js";

export const cleanTGMessages: CommandFlow = (ctx, _args) => {
  const messagesDir = path.resolve(__dirname, `../temp/tg/messages`);

  const messageFiles = fs.readdirSync(messagesDir, { encoding: "utf-8" });

  messageFiles.forEach((m) => {
    // eslint-disable-next-line no-console
    console.log(m);
    const message = fs.readFileSync(path.resolve(messagesDir, m), "utf-8");
    const json = JSON.parse(message);

    fs.writeFileSync(
      path.resolve(messagesDir, m),
      JSON.stringify(
        {
          ...json,
          chat: {
            id: 0,
            first_name: "API",
            last_name: "CLI",
            username: "api-cli",
            type: "private",
          },
          from: {
            id: 0,
            is_bot: false,
            first_name: "API",
            last_name: "CLI",
            username: "api-cli",
            language_code: "en",
          },
        },
        null,
        2,
      ),
      "utf-8",
    );
  });
};
