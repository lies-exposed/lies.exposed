#!/usr/bin/env bash

set -ex

# start api with pm2
yarn pm2 stop all
yarn pm2 start ecosystem.config.js --only api-serve

# wait api to start
sleep 5

curl -f http://localhost:4010/v1/healthcheck


yarn pm2 stop ecosystem.config.js --only api-serve
