require("module-alias")(process.cwd());
const { getConfig, defineEnv } = require("@econnessione/core/webpack/config");

module.exports = getConfig({
  cwd: __dirname,
  env: defineEnv((t) => ({
    NODE_ENV: t.string,
    PUBLIC_URL: t.string,
    API_URL: t.string,
    DEBUG: t.string,
  })),
  envFileDir: __dirname,
  port: process.env.PORT ?? 4001,
});
