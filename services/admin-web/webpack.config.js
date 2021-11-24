require("module-alias")(process.cwd());
const { getConfig } = require("@econnessione/core/webpack/config");

module.exports = getConfig(__dirname, process.env.PORT ?? 4001);
