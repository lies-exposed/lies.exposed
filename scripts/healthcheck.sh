#!/usr/bin/env bash

set -ex

# start api with pm2
# yarn pm2 start ecosystem.dev.config.js --only api-build-w,api-serve
docker compose up -d --wait liexp.dev

curl -f http://api.liexp.dev/v1/healthcheck
curl -f http://liexp.dev/healthcheck
