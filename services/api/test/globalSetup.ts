import * as path from "path";
import { createGlobalSetup } from "@liexp/backend/lib/test/setup/globalSetup.js";
import { ENV } from "../src/io/ENV.js";

const dotenvConfigPath = path.resolve(
  process.env.DOTENV_CONFIG_PATH ?? path.join(__dirname, "../.env.test"),
);

export default createGlobalSetup(ENV, dotenvConfigPath);
