require("module-alias")(process.cwd());
const path = require("path");
const { getConfig } = require("@econnessione/core/webpack/config");
const tsConfig = require("./tsconfig.json");

const config = {
  ...getConfig(__dirname, tsConfig),
  devServer: {
    static: {
      directory: path.join(__dirname, "build"),
    },
    compress: true,
    port: 4000,
  },
};
module.exports = config;
