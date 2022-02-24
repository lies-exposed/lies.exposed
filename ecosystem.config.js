const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const {
  SSH_KEY,
  SSH_USERNAME,
  SSH_HOST,
  REF = "origin/release/alpha",
} = process.env;

module.exports = {
  apps: [
    {
      name: "web",
      cwd: path.resolve(__dirname, "./services/web"),
      script: "./build/server/ssr.js",
      listen_timeout: 100000,
      watch: ["src", "build"],
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
      key: SSH_KEY, // path to the public key to authenticate
      // user used to authenticate
      user: SSH_USERNAME,
      // where to connect
      host: [SSH_HOST],
      ref: REF,
      path: "/root/node/app",
      repo: "https://github.com/lies-exposed/lies.exposed.git",
      "pre-deploy-local": [
        `scp ./services/web/.env.alpha ${SSH_HOST}:envs/web/.env`,
        `scp ./services/admin-web/.env.alpha ${SSH_HOST}:envs/admin/.env`,
      ].join(" && "),
      "post-deploy": [
        "set -e -x",
        "cp ~/.env ./.env",
        "cp ~/envs/admin/.env ./services/admin-web/.env",
        "cp ~/envs/web/.env ./services/web/.env",
        "cp -r ~/certs/dev-certificate.crt ./services/api/certs/alpha-db-ca-certificate.crt",
        "yarn",
        "yarn packages:build",
        "NODE_ENV=production yarn admin-web build",
        "mkdir -p /var/www/html/alpha.lies.exposed/admin",
        "cp -r /root/node/app/current/services/admin-web/build/* /var/www/html/alpha.lies.exposed/admin",
        "sudo chown -R www-data:www-data /var/www/html/alpha.lies.exposed",
        "NODE_ENV=production yarn web build",
        "NODE_ENV=production yarn api build",
        "NODE_ENV=production yarn api migration:run",
        "sudo nginx -s reload",
        "pm2 reload ecosystem.config.js",
      ].join(" && "),
    },
  },
};
