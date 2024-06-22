import { getORMConfig } from "./build/utils/data-source.js";
import { ENV } from "./build/io/ENV.js";
import { PathReporter } from "io-ts/PathReporter";
import { loadENV } from "@liexp/core/lib/env/utils.js";
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
