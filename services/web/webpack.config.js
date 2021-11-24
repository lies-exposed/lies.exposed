require("module-alias")(process.cwd());
const { getConfig, defineEnv } = require("@econnessione/core/webpack/config");

const AppEnv = defineEnv((t) => ({
  NODE_ENV: t.string,
  PUBLIC_URL: t.string,
  API_URL: t.string,
  DEBUG: t.string,
}));

const config = getConfig({
  cwd: __dirname,
  env: AppEnv,
  envFileDir: __dirname,
  port: process.env.PORT ?? 4000,
});

module.exports = config;
