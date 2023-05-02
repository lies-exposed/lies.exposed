import { loadENV } from "@liexp/core/lib/env/utils";
import { TE } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import D from "debug";
import { pipe } from "fp-ts/lib/function";
import prompts from "prompts";
import { makeContext } from "../src/server";
import { postToIG } from "@flows/events/postToIG.flow";
import { parseENV } from "@utils/env.utils";

const run = async (): Promise<any> => {
  loadENV(process.cwd(), process.env.DOTENV_CONFIG_PATH ?? "../../.env");

  D.enable(process.env.DEBUG ?? "");

  return await pipe(
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
            actors: [],
            groups: [],
            platforms: { IG: true, TG: true },
          },
          async (body) => {

            // eslint-disable-next-line @typescript-eslint/naming-convention
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
          }
        )
      );
    }),
    throwTE
  );
};

// eslint-disable-next-line no-console
run().catch(console.error);
