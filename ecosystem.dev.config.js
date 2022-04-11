const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { webServe, apiServe } = require("./ecosystem.config");

const webEnv = dotenv.parse(
  fs.readFileSync(
    path.resolve(__dirname, "./services/web/.env.development"),
    "utf-8"
  )
);


module.exports = {
  apps: [
    {
      name: "web-watch",
      namespace: 'liexp',
      cwd: path.resolve(__dirname, "./services/web"),
      script: "yarn watch",
      watch: false,
      env: webEnv,
    },
    {
      ...webServe,
      env: webEnv,
    },
    {
      name: "api-watch",
      namespace: 'liexp',
      cwd: path.resolve(__dirname, "./services/api"),
      script: "yarn watch",
      watch: false,
    },
    apiServe,
    {
      name: "admin",
      namespace: 'liexp',
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
