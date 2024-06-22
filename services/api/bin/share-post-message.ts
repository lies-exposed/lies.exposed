/* eslint-disable import/no-named-as-default */
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { pipe } from "fp-ts/function";
import prompts from "prompts";
import { startContext, stopContext } from "./start-ctx";
import { postToIG } from "#flows/social-posts/postToIG.flow";

const run = async (): Promise<any> => {
  const ctx = await startContext();

  await pipe(
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
        schedule: undefined,
        useReply: false
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
    ),
    throwTE
  );

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
run().catch(console.error);
