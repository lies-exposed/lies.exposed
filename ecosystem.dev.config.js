const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { webServe } = require("./ecosystem.config");

const DOTENV_CONFIG_PATH = process.env.DOTENV_CONFIG_PATH ?? '.env';

const apiEnv = dotenv.parse(
  fs.readFileSync(path.resolve(__dirname, DOTENV_CONFIG_PATH), "utf-8")
);

const webEnv = dotenv.parse(
  fs.readFileSync(
    path.resolve(__dirname, "./services/web/", DOTENV_CONFIG_PATH),
    "utf-8"
  )
);
/** {} */
module.exports = {
  apps: [
    {
      name: "web-app-watch",
      namespace: "liexp",
      cwd: path.resolve(__dirname, "./services/web"),
      script: "yarn watch:app",
      watch_delay: 3000,
      watch: false,
      env: webEnv,
    },
    {
      name: "web-server-watch",
      namespace: "liexp",
      cwd: path.resolve(__dirname, "./services/web"),
      script: "yarn watch:server",
      watch_delay: 3000,
      watch: false,
      env: webEnv,
    },
    {
      ...webServe,
      env: webEnv,
    },
    {
      name: "api-develop",
      namespace: "liexp",
      cwd: path.resolve(__dirname, "./services/api"),
      script: "yarn develop",
      watch: [path.resolve(__dirname, "./services/api/src")],
      watch_delay: 2000,
      ignore_watch: [
        path.resolve(__dirname, "./services/api/node_modules"),
        path.resolve(__dirname, "./services/api/build"),
      ],
      env: apiEnv,
    },
    {
      name: "admin",
      namespace: "liexp",
      cwd: path.resolve(__dirname, "./services/admin-web"),
      script: "yarn start",
      watch: false,
      env: dotenv.parse(
        fs.readFileSync(
          path.resolve(__dirname, "./services/admin-web/.env.development"),
          "utf-8"
        )
      ),
    },
  ],
};
