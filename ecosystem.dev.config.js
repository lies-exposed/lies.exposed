const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const DOTENV_CONFIG_PATH = process.env.DOTENV_CONFIG_PATH ?? ".env";

const apiEnv = dotenv.parse(
  fs.readFileSync(
    path.resolve(__dirname, "./services/api/", DOTENV_CONFIG_PATH),
    "utf-8"
  )
);

const webEnv = dotenv.parse(
  fs.readFileSync(
    path.resolve(__dirname, "./services/web/", DOTENV_CONFIG_PATH),
    "utf-8"
  )
);

const adminEnv = dotenv.parse(
  fs.readFileSync(
    path.resolve(__dirname, "./services/admin-web/", DOTENV_CONFIG_PATH),
    "utf-8"
  )
);

const apiDevelop = {
  name: "api-dev",
  namespace: "liexp",
  cwd: path.resolve(__dirname, "./services/api"),
  script: "yarn develop",
  env: apiEnv,
};

module.exports = {
  apps: [
    {
      name: "web-dev",
      namespace: "liexp",
      cwd: path.resolve(__dirname, "./services/web"),
      script: "yarn dev",
      watch_delay: 3000,
      watch: false,
      env: webEnv,
    },
    apiDevelop,
    {
      name: "admin-dev",
      namespace: "liexp",
      cwd: path.resolve(__dirname, "./services/admin-web"),
      script: "yarn start",
      watch: false,
      env: adminEnv,
    },
  ],
};
