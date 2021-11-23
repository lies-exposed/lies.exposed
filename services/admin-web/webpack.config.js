require("module-alias")(process.cwd());
const path = require("path");
const { getConfig } = require("@econnessione/core/webpack/config");
const tsConfig = require("./tsconfig.json");

module.exports = getConfig(__dirname, process.env.PORT ?? 4001);
