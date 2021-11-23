require("module-alias")(process.cwd());
const path = require("path");
const { getConfig } = require("@econnessione/core/webpack/config");
const CopyWebpackPlugin = require("copy-webpack-plugin");

const config = getConfig(__dirname, process.env.PORT ?? 4000);
module.exports = {
  ...config,
  plugins: [
    ...config.plugins,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "public"),
        },
      ],
    }),
  ],
};
