require("module-alias")(process.cwd());
const { getConfig } = require("@econnessione/core/webpack/config");

const baseConfig = getConfig(__dirname, process.env.PORT ?? 4000);

const config = {
  ...baseConfig,
  plugins: [...baseConfig.plugins],
};

module.exports = config;
