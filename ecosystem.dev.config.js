const dotenv = require('dotenv');
const path = require("path");
const fs = require("fs");
const { webServe, apiServe } = require("./ecosystem.config");

module.exports = {
  apps: [
    {
      name: "web-watch",
      cwd: path.resolve(__dirname, "./services/web"),
      script: "yarn watch",
      watch: false,
      env: dotenv.parse(
        fs.readFileSync(
          path.resolve(__dirname, "./services/web/.env.development"),
          "utf-8"
        )
      ),
    },
    webServe,
    {
      name: "api-watch",
      cwd: path.resolve(__dirname, "./services/api"),
      script: "yarn watch",
      watch: false,
    },
    apiServe,
    {
      name: "admin",
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
