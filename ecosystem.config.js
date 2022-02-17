const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

module.exports = {
  apps: [
    {
      name: "web",
      cwd: path.resolve(__dirname, "./services/web"),
      script: "./build/server/ssr.js",
      listen_timeout: 100000,
      watch: ['src', 'build'],
      watch_delay: 1000,
      env: dotenv.parse(
        fs.readFileSync(path.resolve(__dirname, ".env"), "utf-8")
      ),
    },
    {
      name: "api",
      cwd: path.resolve(__dirname, "./services/api"),
      script: "./build/run.js",
      wait_ready: true,
      listen_timeout: 10000,
      env: dotenv.parse(
        fs.readFileSync(path.resolve(__dirname, ".env"), "utf-8")
      ),
    },
  ],
  deploy: {
    alpha: {
      // path.resolve(os.homedir(), ".ssh/lies_exposed_api"),
      key: process.env.SSH_KEY, // path to the public key to authenticate
      // user used to authenticate
      user: process.env.SSH_USERNAME,
      // where to connect
      host: [process.env.SSH_HOST],
      ref: process.env.REF ?? "origin/release/alpha",
      path: "/root/node/app",
      repo: "https://github.com/lies-exposed/lies.exposed.git",
      "pre-deploy-local": "echo 'This is a local executed command'",
      "post-deploy": [
        "set -e -x",
        "cp ~/.env ~/node/app/source/.env",
        "cp -r ~/certs/dev-certificate.crt ~/node/app/source/services/api/certs/alpha-db-ca-certificate.crt",
        "yarn",
        "yarn api build",
        "yarn api migration:run",
        "pm2 reload ecosystem.config.js api",
      ].join(" && "),
    },
  },
};
