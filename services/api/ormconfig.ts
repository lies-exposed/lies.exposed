/* eslint-disable @typescript-eslint/no-var-requires */
require("module-alias")(process.cwd());
import { getORMConfig } from "./build/utils/data-source";
import { ENV } from "./build/io/ENV";
import { PathReporter } from "io-ts/lib/PathReporter";
import { loadENV } from "@liexp/core/lib/env/utils";
import D from 'debug';
import { DataSource } from 'typeorm';

loadENV(
  process.cwd(),
  process.env.DOTENV_CONFIG_PATH !== undefined
    ? process.env.DOTENV_CONFIG_PATH
    : "../../.env"
);

D.enable(process.env.DEBUG ?? "@liexp:*");

const decodedEnv = ENV.decode(process.env);

if (decodedEnv._tag === "Left") {
  console.error(PathReporter.report(decodedEnv));
  throw new Error("process.env is malformed");
}
const env = decodedEnv.right;

const config = getORMConfig(env, true);

export default new DataSource(config);
