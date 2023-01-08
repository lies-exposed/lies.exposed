import { loadENV } from "@liexp/core/lib/env/utils";
import { TE } from "@liexp/core/lib/fp";
import { parseENV } from "@utils/env.utils";
import { pipe } from "fp-ts/lib/function";
import { makeContext } from "../src/server";
import { postToIG } from "@flows/events/postToIG.flow";
import prompts from "prompts";
import { throwTE } from "@liexp/shared/src/utils/task.utils";
import D from "debug";

const run = async () => {
  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? "../../.env");

  D.enable(process.env.DEBUG ?? "");
  return pipe(
    parseENV({ ...process.env, TG_POLLING: "false" }),
    TE.fromEither,
    TE.chain(makeContext),
    TE.chain((ctx) => {
      return pipe(
        postToIG(ctx)(
          {
            title: "Dummy test",
            content: "Super interesting content",
            media: [],
            date: new Date().toISOString(),
            url: "",
            keywords: [],
            platforms: { IG: true, TG: true },
          },
          async (body) => {
            console.log(body);
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

            console.log(result);
            return { code: result.code };
          }
        )
      );
    }),
    throwTE
  );
};

run().catch(console.error);
