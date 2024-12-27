import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { pipe } from "fp-ts/lib/function.js";
import prompts from "prompts";
import { postToIG } from "../flows/social-post/postToIG.flow.js";
import { type CommandFlow } from "./command.type.js";

export const sharePostMessage: CommandFlow = async (ctx) => {
  await pipe(
    postToIG(
      {
        title: "Dummy test",
        content: "Super interesting content",
        media: [],
        date: new Date().toISOString(),
        url: "",
        keywords: [],
        actors: [],
        groups: [],
        platforms: { IG: true, TG: true },
        schedule: undefined,
        useReply: false,
      },
      async (body) => {
        const { totp_two_factor_on } = body.two_factor_info;
        // decide which method to use
        const verificationMethod = totp_two_factor_on ? "0" : "1"; // default to 1 for SMS
        // At this point a code should have been sent
        // Get the code

        const result = await prompts({
          type: "text",
          name: "code",
          message: `Enter code received via ${
            verificationMethod === "1" ? "SMS" : "TOTP"
          }`,
        });

        // eslint-disable-next-line no-console
        console.log(result);
        return { code: result.code };
      },
    )(ctx),
    throwTE,
  );
};
