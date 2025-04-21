import { getORMConfig } from "@liexp/backend/lib/utils/data-source.js";
import { ENV } from "./build/io/ENV.js";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import D from "debug";
import { DataSource } from "typeorm";
import { Schema } from "effect";

loadENV(
  process.cwd(),
  process.env.DOTENV_CONFIG_PATH !== undefined
    ? process.env.DOTENV_CONFIG_PATH
    : "../../.env",
);

D.enable(process.env.DEBUG ?? "@liexp:*");

const decodedEnv = Schema.decodeUnknownEither(ENV)(process.env);

if (decodedEnv._tag === "Left") {
  console.error(decodedEnv.left);
  throw new Error("process.env is malformed");
}
const env = decodedEnv.right;

const config = {
  ...getORMConfig(env, true),
  migrations:
    env.NODE_ENV === "test"
      ? undefined
      : [`${process.cwd()}/build/migrations/*.js`],
};

export default new DataSource(config);
