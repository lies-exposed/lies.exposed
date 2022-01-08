import { getConfig, defineEnv } from "../../packages/@econnessione/core/src/webpack/config";

const AppEnv = defineEnv((t) => ({
  NODE_ENV: t.string,
  PUBLIC_URL: t.string,
  API_URL: t.string,
  DEBUG: t.string,
}));

const port = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 4000

const config = getConfig({
  cwd: __dirname,
  env: AppEnv,
  envFileDir: __dirname,
  port,
});

export default {
  ...config,
}
