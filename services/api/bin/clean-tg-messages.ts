import * as fs from "fs";
import * as path from "path";
import { fc } from "@liexp/test/lib/index.js";
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
          chat: fc.sample(
            fc.record({
              id: fc.nat(),
              first_name: fc.string(),
              last_name: fc.string(),
              username: fc.string(),
              type: fc.constant("private"),
            }),
          )[0],
          from: fc.sample(
            fc.record({
              id: fc.nat(),
              is_bot: fc.boolean(),
              first_name: fc.string(),
              last_name: fc.string(),
              username: fc.string(),
              language_code: fc.constant("en"),
            }),
          )[0],
        },
        null,
        2,
      ),
      "utf-8",
    );
  });
};
