const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const {
  SSH_KEY,
  SSH_USERNAME,
  SSH_HOST,
  REF = "origin/release/alpha",
} = process.env;

const apiServe = {
  namespace: 'liexp',
  name: "api-serve",
  cwd: path.resolve(__dirname, "./services/api"),
  script: "yarn start",
  watch: ["build"],
  watch_delay: 1000,
  wait_ready: true,
  listen_timeout: 10000,
  kill_timeout: 3000,
  env: {
    ...dotenv.parse(fs.readFileSync(path.resolve(__dirname, "./services/api/.env"), "utf-8")),
    DEBUG: "@liexp*"
  }
};

const webServe = {
  namespace: 'liexp',
  name: "web-serve",
  cwd: path.resolve(__dirname, "./services/web"),
  script: "./build/server/ssr.js",
  listen_timeout: 100000,
  watch: true,
  watch: ["build"],
  watch_delay: 1000,
  env: dotenv.parse(
    fs.readFileSync(path.resolve(__dirname, "./services/web/.env"), "utf-8")
  ),
};

module.exports = {
  apiServe,
  webServe,
  apps: [apiServe, webServe],
  deploy: {
    alpha: {
      // path.resolve(os.homedir(), ".ssh/lies_exposed_api"),
      key: SSH_KEY, // path to the public key to authenticate
      // user used to authenticate
      user: SSH_USERNAME,
      // where to connect
      host: [SSH_HOST],
      ref: REF,
      path: "/root/node/app",
      repo: "https://github.com/lies-exposed/lies.exposed.git",
      "pre-deploy-local": "scripts/pre-deploy-local.sh",
      "post-deploy": `scripts/post-deploy.sh ${SSH_HOST}`,
    },
  },
};
