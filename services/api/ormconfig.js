import { getORMConfig } from "@liexp/backend/lib/utils/data-source.js";
import { ENV } from "./build/io/ENV.js";
import { loadENV } from "@liexp/core/lib/env/utils.js";
import D from "debug";
import { DataSource } from "typeorm";
import { Schema } from "effect";
import {GetLogger} from '@liexp/core/lib/logger/Logger.js'



if (process.env.DOTENV_CONFIG_PATH) {
  const DOTENV_CONFIG_PATH =
    process.env.DOTENV_CONFIG_PATH !== undefined
      ? process.env.DOTENV_CONFIG_PATH
      : ".env";

  loadENV(process.cwd(), DOTENV_CONFIG_PATH);
}

D.enable(process.env.DEBUG ?? "@liexp:*");

const dataSourceLogger = GetLogger('data-source');

dataSourceLogger.debug.log("Validating process.env: %O", process.env);

const decodedEnv = Schema.decodeUnknownEither(ENV)(process.env);

if (decodedEnv._tag === "Left") {
  console.error(decodedEnv.left);
  throw new Error("process.env is malformed");
}

const env = decodedEnv.right;

const config = {
  ...getORMConfig(env),
  migrations: [`${process.cwd()}/build/migrations/*.js`],
};
dataSourceLogger.debug.log('Exporting DataSource with config %O', config)

export default new DataSource(config);
